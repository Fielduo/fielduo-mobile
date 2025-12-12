import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import Mapbox from "@rnmapbox/maps";
import { api } from "@/src/api/cilent";


// Import location functions from expo-location
import { 
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
  Accuracy 
} from 'expo-location';
import Constants from "expo-constants";
import Header from "../common/Header";
import HeaderSection from "../common/HeaderSection";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LocationTracker from "@/store/LocationTracker";

type ActionIconName = 
  | "file-plus"
  | "account-plus"
  | "calendar-clock"
  | "file-chart";
  type CardIconName =
  | "map-marker"
  | "account-group"
  | "calendar-check"
  | "trending-up";
const mapboxToken = Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN;

if (!mapboxToken) {
  throw new Error("MAPBOX_ACCESS_TOKEN is missing");
}

Mapbox.setAccessToken(mapboxToken);
// -------------------- Type Definitions --------------------
type TechnicianLocation = {
  id: number;
  technician_id: number;
  organization_id: number;
  tracking_date: string;
  current_location: {
    latitude: number;
    longitude: number;
    speed: number;
    accuracy: number;
    timestamp: string;
    status: string;
  };
  location_history: {
    latitude: number;
    longitude: number;
    speed: number;
    accuracy: number;
    timestamp: string;
    status: string;
  }[];
  status: string;
  updated_at: string;
};

type TechnicianLocationResponse = {
  success: boolean;
  technician_locations: TechnicianLocation[];
};

// -------------------- Component --------------------
export default function DashboardScreen() {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [technicians, setTechnicians] = useState<TechnicianLocation[]>([]);
  const cameraRef = useRef<any>(null);

  // const DEFAULT_COORDS = { latitude: 12.9716, longitude: 77.5946 }; // fallback

  // Fetch technician locations from API
  const fetchTechnicians = async () => {
    try {
      const res = await api.get<TechnicianLocationResponse>("/technician-locations");
      if (res.success) setTechnicians(res.technician_locations);
    } catch (err) {
      console.log("Fetching technicians failed:", err);
    }
  };

  // Move camera on map
  const moveCamera = (coords: { latitude: number; longitude: number }) => {
    cameraRef.current?.setCamera({
      centerCoordinate: [coords.longitude, coords.latitude],
      zoomLevel: 14,
      animationDuration: 1000,
    });
  };

  useEffect(() => {
    const initLocation = async () => {
      try {
        const { status } = await requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Location permission denied");
          return;
        }

        const loc = await getCurrentPositionAsync({ accuracy: Accuracy.Highest });
        const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setUserLocation(coords);
        moveCamera(coords);

        // Start tracking location updates
        LocationTracker.onLocationUpdate = (loc) => {
          const newCoords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          setUserLocation(newCoords);
          moveCamera(newCoords);
        };
        LocationTracker.start();
      } catch (err) {
        console.log("Failed to get initial location:", err);
      }
    };

    initLocation();

    fetchTechnicians();
    const interval = setInterval(fetchTechnicians, 15000);

    return () => {
      LocationTracker.stop();
      clearInterval(interval);
    };
  }, []);

   const cards: {
  title: string;
  icon: CardIconName;
  color: string;
  value: string;
  change: string;
}[] = [
    { title: "Active Fields", icon: "map-marker", color: "#1E88E5", value: "24", change: "+12%" },
    { title: "Field Workers", icon: "account-group", color: "#009587", value: "156", change: "+5.1%" },
    { title: "Scheduled Jobs", icon: "calendar-check", color: "#D9C425", value: "89", change: "+23%" },
    { title: "Efficiency Rate", icon: "trending-up", color: "#6234E2", value: "94.2%", change: "+5.1%" },
  ];

 const actions: { icon: ActionIconName; text: string; bg: string; color: string }[] = [
    { icon: "file-plus", text: "Create New\nField Survey", bg: "#0078DB1A", color: "#1E88E5" },
    { icon: "account-plus", text: "Assign Field\nWorker", bg: "#0095871A", color: "#009587" },
    { icon: "calendar-clock", text: "Schedule\nMaintenance", bg: "#FDE6371A", color: "#D9C425" },
    { icon: "file-chart", text: "Generate\nReport", bg: "#6234E21A", color: "#6234E2" },
  ];

  const activities = [
    { title: "New field survey completed", sub: "North District · 2 min ago", color: "#009587", bg: "#E8F5E9", status: "Completed" },
    { title: "Equipment maintenance scheduled", sub: "Central Hub · 15 min ago", color: "#D9C425", bg: "#FFF8E1", status: "Pending" },
    { title: "Worker John assigned to Field #42", sub: "South District · 1 hour ago", color: "#1E88E5", bg: "#E3F2FD", status: "Active" },
    { title: "Quality inspection passed", sub: "East Region · 2 hours ago", color: "#009587", bg: "#E8F5E9", status: "Completed" },
  ];
  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
         <Header />
      <HeaderSection
        title="What services do you need?"
        buttonText="+ New Field"
        onButtonClick={() => console.log("New Field Clicked")}
        onSearchChange={(text) => console.log("Searching:", text)}
        currentScreen="DashboardScreen"   // ✅ add this
      />
       <View style={styles.cardContainer}>
          {cards.map((c, i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{c.title}</Text>
                <MaterialCommunityIcons name={c.icon} size={24} color={c.color} />
              </View>
              <Text style={[styles.cardValue, { color: c.color }]}>{c.value}</Text>
              <Text style={styles.cardSubText}><Text style={styles.percentText}>{c.change}</Text> from last month</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Live Technician Map</Text>
        <View style={styles.mapContainer}>
          <Mapbox.MapView style={styles.map}>
            {userLocation && (
              <Mapbox.Camera
                ref={cameraRef}
                centerCoordinate={[userLocation.longitude, userLocation.latitude]}
                zoomLevel={14}
              />
            )}
            <Mapbox.UserLocation visible showsUserHeadingIndicator />
            {technicians.map((t) => (
             <Mapbox.PointAnnotation
  key={t.id.toString()}
  id={`tech-${t.id}`}
  coordinate={[t.current_location.longitude, t.current_location.latitude]}
>

                <View style={styles.marker}>
                  <Text style={styles.markerText}>🧑‍🔧</Text>
                </View>
              </Mapbox.PointAnnotation>
            ))}
          </Mapbox.MapView>
        </View>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {actions.map((a, i) => (
            <TouchableOpacity key={i} style={styles.actionItem}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: a.bg, borderColor: a.color, borderWidth: 2 },
                ]}
              >
                <MaterialCommunityIcons name={a.icon} size={28} color={a.color} />
              </View>

              <Text style={styles.actionText}>{a.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activities */}
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        {activities.map((a, i) => (
          <View key={i} style={styles.activityCard}>
            <View>
              <Text style={styles.activityTitle}>{a.title}</Text>
              <Text style={styles.activitySubtitle}>{a.sub}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: a.bg, borderColor: a.color, borderWidth: 1 }]}>
              <Text style={[styles.statusText, { color: a.color, }]}>{a.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
  },

  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 4,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  cardTitle: {
    fontSize: 14,
    color: "#101318CC",
    fontWeight: "600",
  },

  cardValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },

  cardSubText: {
    fontSize: 12,
    color: "#101318",
  },

  percentText: {
    color: "#009587",
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 12,
    color: "#101318",
    marginBottom: 20,
  },

  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  actionItem: {
    alignItems: "center",
    width: 72,
  },

  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  actionText: {
    fontSize: 10,
    textAlign: "center",
    color: "#101318CC",
  },

  activityCard: {
    backgroundColor: "#FFF",
    borderRadius: 4,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },

  activityTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#101318CC",
  },

  activitySubtitle: {
    fontSize: 10,
    color: "#101318CC",
    marginTop: 2,
  },

  statusBadge: {
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
  },

  statusText: {
    fontSize: 9,
    fontWeight: "600",
  },


  mapContainer: {
    width: Dimensions.get("window").width - 32,
    height: 400,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  map: { flex: 1 },

  marker: {
    width: 34,
    height: 34,
    backgroundColor: "#fff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  markerText: { fontSize: 18 },
});
