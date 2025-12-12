// MapRoute.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
  Animated,
  Linking,
} from "react-native";
import Mapbox, { MapView, PointAnnotation, ShapeSource, LineLayer } from "@rnmapbox/maps";
import Geolocation from "react-native-geolocation-service";
import polyline from "@mapbox/polyline";
import { api } from "@/src/api/cilent";
import { Ionicons } from "@expo/vector-icons";
import { requestLocationPermission } from "@/store/useLocationPermission";
import Constants from 'expo-constants';

const mapboxToken = Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN;

if (!mapboxToken) {
  throw new Error("MAPBOX_ACCESS_TOKEN is missing");
}

Mapbox.setAccessToken(mapboxToken);

const WATCH_OPTIONS = { enableHighAccuracy: true, distanceFilter: 5, interval: 2500 };

// --- ensure Job type is defined in the same scope or imported ---
interface Job {
  id: string;
  work_order_title?: string;
  schedule_status?: string;
  latitude?: number | string;
  longitude?: number | string;
  route_order?: number;
  assigned_to_name?: string;
}

interface Props {
  jobs: Job[];
  assignedUserId: string | number;
  selectedDate?: string;
  onClose?: () => void;
  onOptimizationComplete?: (route: any) => void;
}

interface OptimizeRouteResponse {
  route: {
    geometry: string;
    distance?: number;
    duration?: number;
    legs?: any[];
  };
}

// -------- Helpers ---------
const parseCoord = (val: number | string | undefined): number => {
  if (val === undefined || val === null) return 0; // fallback
  return typeof val === "string" ? parseFloat(val) : val;
};

const haversineMeters = (a: number[], b: number[]) => {
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
};

const getBearing = (start: [number, number], end: [number, number]) => {
  // start/end are [lng, lat]
  const [lng1, lat1] = start;
  const [lng2, lat2] = end;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const y = Math.sin(toRad(lng2 - lng1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lng2 - lng1));

  const brng = (toDeg(Math.atan2(y, x)) + 360) % 360;
  // Mapbox/React Native rotate expects degrees, we'll convert to -180..180 for nicer rotation if needed
  return brng;
};

// --------- Component ----------
const MapRoute: React.FC<Props> = ({
  jobs,
  assignedUserId,
  selectedDate,
  onClose,
  onOptimizationComplete,
}) => {

  const cameraRef = useRef<any>(null);

  const [totalDistance, setTotalDistance] = useState(0);
  const [showDistancePopup, setShowDistancePopup] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null); // [lng, lat]
  const [routeCoords, setRouteCoords] = useState<number[][]>([]);
  const routeSnapRef = useRef<number[][]>([]);
  const [tracking, setTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0)).current; // for user dot pulse
  const [hasOptimizedRoute, setHasOptimizedRoute] = useState(false);


  // Car / moving marker
  const [carCoord, setCarCoord] = useState<[number, number] | null>(null); // [lng, lat]
  const [carRotation, setCarRotation] = useState<number>(0); // degrees
  const scaleAnim = useRef(new Animated.Value(1)).current; // pulse for car icon
  const prevCarRef = useRef<[number, number] | null>(null); // previous coordinate for bearing

  // Zoom state
  const [zoomLevel, setZoomLevel] = useState(13);

  // -------- User location init --------
  useEffect(() => {
    const init = async () => {
      const allowed = await requestLocationPermission();
      if (!allowed) return Alert.alert("Error", "Location permission denied");

      Geolocation.getCurrentPosition(
        (pos: Geolocation.GeoPosition) => {
          const initial: [number, number] = [pos.coords.longitude, pos.coords.latitude];
          setUserLocation(initial);
          setCarCoord(initial);
          prevCarRef.current = initial;
        },
        (error: Geolocation.GeoError) => Alert.alert("Error", "Unable to fetch location"),
        { enableHighAccuracy: true }
      );

    };
    init();
    return stopLiveTracking;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------- Animate Pulse for user dot (unchanged) --------
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  // start/stop car pulse animation
  const startCarPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.12, duration: 700, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopCarPulse = () => {
    scaleAnim.stopAnimation();
    scaleAnim.setValue(1);
  };

  const calculateDistanceToJob = (userLoc: [number, number] | null, jobLoc: [number, number] | null) => {
    if (!userLoc || !jobLoc) return 0;
    return haversineMeters(userLoc, jobLoc) / 1000;
  };

  // Example: distance from user → first job
  useEffect(() => {
    if (!userLocation || jobs.length === 0) return;

    const job = jobs[0];

    const jobCoord: [number, number] = [parseCoord(job.longitude) ?? 0, parseCoord(job.latitude) ?? 0];

    const dist = calculateDistanceToJob(userLocation, jobCoord);
    console.log("Distance to job:", dist, "km");
  }, [userLocation, jobs]);

  // -------- Optimize Route --------
  const handleOptimizeRoute = async () => {
    try {
      setOptimizing(true);

      // 🛑 Stop live GPS tracking if active
      if (tracking) {
        stopLiveTracking();
      }

      // Delay so GPS frees up
      await new Promise((res) => setTimeout(res, 500));

      Geolocation.getCurrentPosition(
        async (pos: Geolocation.GeoPosition) => {
          const stableStart: { latitude: number; longitude: number } = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };

          const res = await api.post<OptimizeRouteResponse>("/job_schedules/optimize-route", {
            assigned_to: assignedUserId,
            date: selectedDate,
            start_location: stableStart,
          });

          if (!res.route?.geometry) {
            Alert.alert("Error", "Invalid route returned");
            return;
          }

          const coords: number[][] = polyline.decode(res.route.geometry)
            .map(([lat, lng]: [number, number]) => [lng, lat]);

          setRouteCoords(coords);
          setHasOptimizedRoute(true);

          // ✔ Optional: Restart live tracking after optimizing
          setTimeout(() => startLiveTracking(), 800);
        },
        (error: Geolocation.GeoError) => {
          console.log("GPS error:", error);
          Alert.alert("Error", "Unable to fetch accurate location");
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Route optimization failed");
    } finally {
      setOptimizing(false);
    }
  };

  // -------- Live tracking --------
  const startLiveTracking = () => {
    if (tracking) return;
    setTracking(true);



    // Ensure car starts at the latest known user location
    if (userLocation) {
      setCarCoord(userLocation);
      prevCarRef.current = userLocation;
    }

    startCarPulse();

    watchIdRef.current = Geolocation.watchPosition(
      (pos: Geolocation.GeoPosition): void => {
        const lng: number = pos.coords.longitude;
        const lat: number = pos.coords.latitude;
        const newLoc: [number, number] = [lng, lat];

        // rotation: compute bearing from previous car position to new location
        if (prevCarRef.current) {
          const bearing: number = getBearing(prevCarRef.current, newLoc);
          setCarRotation(bearing);
        }

        // update prev ref and state (Mapbox will animate marker position visually)
        prevCarRef.current = newLoc;
        setCarCoord(newLoc);
        setUserLocation(newLoc);

        // center camera (optional)
        cameraRef.current?.setCamera({
          centerCoordinate: newLoc,
          zoomLevel,
          animationDuration: 500,
        });
      },
      (err: Geolocation.GeoError): void => {
        console.log("GPS tracking error", err);
        Alert.alert("Error", "GPS tracking error");
      },
      WATCH_OPTIONS
    );
  };

  const stopLiveTracking = () => {
    if (watchIdRef.current !== null) Geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
    setTracking(false);

    stopCarPulse();
  };

  const openInGoogleMaps = () => {
    if (!userLocation) {
      Alert.alert("Error", "User location missing");
      return;
    }

    const origin = `${userLocation[1]},${userLocation[0]}`; // lat, lng
    const waypoints = jobs.map((job) => `${parseCoord(job.latitude)},${parseCoord(job.longitude)}`).join("|");

    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${origin}&waypoints=${waypoints}&travelmode=driving`;

    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Unable to open Google Maps");
    });
  };

  useEffect(() => {
    if (!cameraRef.current) return;
    if (!userLocation) return;
    if (jobs.length === 0) return;

    const coords = [
      userLocation, // your live location
      ...jobs.map((job) => [parseCoord(job.longitude), parseCoord(job.latitude)]),
    ];

    cameraRef.current.fitBounds(coords[0], coords[coords.length - 1], 120, 1000);
  }, [jobs, userLocation]);

  // -------- Zoom handlers --------
  const zoomIn = () => {
    const newZoom = Math.min(zoomLevel + 1, 20);
    setZoomLevel(newZoom);
    cameraRef.current?.setCamera({ zoomLevel: newZoom, animationDuration: 300 });
  };

  const zoomOut = () => {
    const newZoom = Math.max(zoomLevel - 1, 2);
    setZoomLevel(newZoom);
    cameraRef.current?.setCamera({ zoomLevel: newZoom, animationDuration: 300 });
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }}>
        <Mapbox.Camera
          ref={cameraRef}
          zoomLevel={zoomLevel}
          centerCoordinate={userLocation ?? [0, 0]}
        />



        {jobs.map((job, index) => {
          const lng = parseCoord(job.longitude);
          const lat = parseCoord(job.latitude);
          if (!lng || !lat) return null; // skip invalid coords

          return (
            <PointAnnotation
              key={`customer-${index}`}
              id={`customer-${index}`}
              coordinate={[lng, lat]}
              anchor={{ x: 0.5, y: 1 }}
            >
              <View
                style={{

                  elevation: 3,
                  alignItems: "center",
                }}
              >
                <Ionicons name="location" size={35} color="#f10303" />
                <Text
                  style={{
                    color: "#000",
                    fontWeight: "bold",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                  numberOfLines={1}
                >
                  {job.work_order_title || "No Title"}
                </Text>


              </View>
            </PointAnnotation>
          );
        })}



        {/* User location dot */}
        {userLocation && (
          <PointAnnotation id="user" coordinate={userLocation}>
            <Animated.View
              style={[
                styles.userDot,
                {
                  transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) }],
                  opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
                },
              ]}
            />
            <View style={styles.userDotInner} />
          </PointAnnotation>
        )}

        {/* Car / moving marker (Ionicons + animated scale + rotation) */}
        {carCoord && (
          <PointAnnotation id="car" coordinate={carCoord}>
            <Animated.View
              style={{
                alignItems: "center",
                justifyContent: "center",
                transform: [
                  { rotate: `${carRotation}deg` }, // rotate icon
                  { scale: scaleAnim }, // small pulse
                ],
              }}
            >
              <Ionicons name="car" size={45} color="#6234E2" />
            </Animated.View>
          </PointAnnotation>
        )}

        {/* Route (hidden while tracking) */}
        {routeCoords.length > 0 && (
          <ShapeSource
            id="route"
            shape={{
              type: "Feature",
              geometry: { type: "LineString", coordinates: routeCoords },
              properties: {},
            }}
          >
            <LineLayer
              id="routeLine"
              style={{
                lineWidth: 4,
                lineColor: "#6234E2",
              }}
            />
          </ShapeSource>
        )}
      </MapView>

      {showDistancePopup && (
        <View style={styles.distancePopupCard}>
          <Text style={styles.distancePopupTitle}>Route optimized</Text>
          <Text style={styles.distancePopupText}>
            Total distance:{" "}
            {totalDistance < 1 ? Math.round(totalDistance * 1000) + " m" : totalDistance.toFixed(1) + " km"}
          </Text>
        </View>
      )}

      {/* Close button */}
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>

      {/* Controls top-right */}
      <View style={styles.controlCard}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#6234E2" }]} onPress={() => handleOptimizeRoute()}>
          {optimizing ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionBtnText}>Optimize</Text>}
        </TouchableOpacity>

        {!tracking ? (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#1E90FF" }]} onPress={startLiveTracking}>
            <Text style={styles.actionBtnText}>Track</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#ef4444" }]} onPress={stopLiveTracking}>
            <Text style={styles.actionBtnText}>Stop</Text>
          </TouchableOpacity>
        )}

        {hasOptimizedRoute && (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "green" }]} onPress={openInGoogleMaps}>
            <Text style={styles.actionBtnText}>Open in Google Maps</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Zoom controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomBtn} onPress={zoomIn}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomBtn} onPress={zoomOut}>
          <Text style={styles.zoomText}>-</Text>
        </TouchableOpacity>
      </View>

      {/* Legend bottom-right */}
      <View style={styles.legendCard}>
        {[
          { color: "green", label: "Scheduled" },
          { color: "orange", label: "Rescheduled" },
          { color: "blue", label: "Completed" },
          { color: "red", label: "Missed" },
          { color: "#fff", label: "Your Location", border: true },
        ].map((item, idx) => (
          <View key={idx} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }, item.border && { borderWidth: 1, borderColor: "#000" }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default MapRoute;

// -------- Styles ---------
const styles = StyleSheet.create({
  userDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#6234E240", position: "absolute" },
  userDotInner: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#6234E2", borderWidth: 2, borderColor: "#fff", position: "absolute", top: 8, left: 8 },

  actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  closeText: { color: "#fff", fontSize: 30, fontWeight: "900", marginTop: -3 },
  bikeCard: { position: "absolute", top: -50, left: -30, backgroundColor: "#000000cc", padding: 6, borderRadius: 6, alignItems: "center" },

  distancePopupCard: {
    position: "absolute",
    top: Platform.OS === "ios" ? 90 : 50,
    alignSelf: "center",
    backgroundColor: "rgba(224, 222, 222, 0.95)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 5,
    zIndex: 1000,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  distancePopupTitle: {
    color: "#2b2a2aff",
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 4,
  },
  distancePopupText: {
    color: "#2b2a2aff",
    fontSize: 16,
    fontWeight: "600",
  },

  controlCard: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    right: 10,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 5,
    flexDirection: "column",
    gap: 8,
  },

  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },

  legendCard: {
    position: "absolute",
    bottom: 30,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.65)",
    padding: 12,
    borderRadius: 6,
    flexDirection: "column",
    gap: 6,
  },
  legendItem: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { color: "#fff", fontWeight: "600", fontSize: 12 },

  // Close button top-left
  closeBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 35,
    left: 20,
    width: 44,
    height: 44,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  // Zoom controls
  zoomControls: {
    position: "absolute",
    bottom: 120,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 6,
    overflow: "hidden",
  },
  zoomBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  zoomText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
