import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Pressable, Modal } from "react-native";
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
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import LocationTracker from "@/store/LocationTracker";
import BackgroundTracker from "@/store/BackgroundTracker";
import { useNavigation } from "@react-navigation/native";



const mapboxToken = Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN;

if (!mapboxToken) {
  throw new Error("MAPBOX_ACCESS_TOKEN is missing");
}

Mapbox.setAccessToken(mapboxToken);
// -------------------- Type Definitions --------------------
type TechnicianLocation = {
  technician_name: string;
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


type ActionIconName =
  | "file-plus"
  | "account-plus"
  | "calendar-clock"
  | "file-chart";

type DashboardMetrics = {
  job_metrics: {
    total_jobs: number;
    completed_jobs: number;
    pending_jobs: number;
    overdue_jobs: number;
    scheduled_jobs: number;
    rescheduled_jobs: number;
    cancelled_jobs: number;
    in_progress_jobs: number;
  };
  active_technicians: number;
  revenue: {
    today: number;
    week: number;
    pending: number;
  };
  alerts: {
    delayed_job: number;
    technician_offline: number;
    customer_escalation: number;
    equipment_maintenance: number;
    low_inventory: number;
  };
};





export default function DashboardScreen() {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [technicians, setTechnicians] = useState<TechnicianLocation[]>([]);
  const cameraRef = useRef<any>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(14);
  const navigation = useNavigation<any>();

  const [selectedTech, setSelectedTech] = useState<any>(null);
  const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);



  // Fetch technician locations from API
  const fetchTechnicians = async () => {
    try {
      const res = await api.get<TechnicianLocationResponse>("/technician-locations");
      if (res.success) setTechnicians(res.technician_locations);
    } catch (err) {
      console.log("Fetching technicians failed:", err);
    }
  };

  const actions: {
    icon: ActionIconName;
    text: string;
    bg: string;
    color: string;
    screen: string;
  }[] = [
      {
        icon: "file-plus",
        text: "Create New\n Triplog",
        bg: "#0078DB1A",
        color: "#1E88E5",
        screen: "TripLogForm",
      },
      {
        icon: "account-plus",
        text: "Assign Field\nWorker",
        bg: "#0095871A",
        color: "#009587",
        screen: "FieldWorkerTripForm",
      },
      {
        icon: "calendar-clock",
        text: "Schedule\nMaintenance",
        bg: "#FDE6371A",
        color: "#D9C425",
        screen: "Schedule",
      },
      // {
      //   icon: "file-chart",
      //   text: "Generate\nReport",
      //   bg: "#6234E21A",
      //   color: "#6234E2",
      //   screen: "ServiceReportForm",
      // },
    ];

  const activities = [
    { title: "New field survey completed", sub: "North District · 2 min ago", color: "#009587", bg: "#E8F5E9", status: "Completed" },
    { title: "Equipment maintenance scheduled", sub: "Central Hub · 15 min ago", color: "#D9C425", bg: "#FFF8E1", status: "Pending" },
    { title: "Worker John assigned to Field #42", sub: "South District · 1 hour ago", color: "#1E88E5", bg: "#E3F2FD", status: "Active" },
    { title: "Quality inspection passed", sub: "East Region · 2 hours ago", color: "#009587", bg: "#E8F5E9", status: "Completed" },
  ];
  const statusColor = (status: string) => {
    switch (status) {
      case "IDLE": return "#22C55E";
      case "TRAVELING_SLOWLY": return "#F59E0B";
      case "IN_TRANSIT": return "#3B82F6";
      case "HIGH_SPEED": return "#EF4444";
      default: return "#6B7280";
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
    let mounted = true;

    const init = async () => {
      const { status } = await requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('❌ Location permission denied');
        return;
      }

      const loc = await getCurrentPositionAsync({
        accuracy: Accuracy.High,
      });

      if (!mounted) return;

      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      setUserLocation(coords);
      moveCamera(coords);

      LocationTracker.onLocationUpdate = (l) => {
        const c = {
          latitude: l.coords.latitude,
          longitude: l.coords.longitude,
        };
        setUserLocation(c);
        moveCamera(c);
      };

      LocationTracker.start();       // FG UI tracking
      BackgroundTracker.start();     // BG REAL tracking
    };

    init();
    fetchTechnicians();

    const i = setInterval(fetchTechnicians, 3000); // 🔥 real time


    return () => {
      mounted = false;
      LocationTracker.stop();
      clearInterval(i);
    };
  }, []);

  useEffect(() => {
    const fetchDashboardData = async (): Promise<void> => {
      try {
        const raw = await api.get<any>('/dashboards/metrics');

        const normalized: DashboardMetrics = {
          job_metrics: {
            total_jobs: raw.job_metrics?.total_jobs ?? 0,
            completed_jobs: raw.job_metrics?.completed_jobs ?? 0,
            pending_jobs: raw.job_metrics?.pending_jobs ?? 0,
            overdue_jobs: raw.job_metrics?.overdue_jobs ?? 0,
            scheduled_jobs: raw.job_status_breakdown?.Scheduled ?? 0,
            rescheduled_jobs: raw.job_status_breakdown?.Rescheduled ?? 0,
            cancelled_jobs: raw.job_status_breakdown?.Cancelled ?? 0,
            in_progress_jobs: raw.job_status_breakdown?.["In Progress"] ?? 0,
          },
          active_technicians: raw.active_technicians ?? 0,
          revenue: {
            today: raw.revenue?.total_revenue ?? 0,
            week: raw.revenue?.weekly_total ?? 0,
            pending: raw.revenue?.pending_revenue ?? 0,
          },
          alerts: {
            delayed_job: 0,
            technician_offline: 0,
            customer_escalation: 0,
            equipment_maintenance: 0,
            low_inventory: 0,
          },
        };

        setMetrics(normalized);
      } catch (error) {
        console.log("Dashboard load failed", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData(); // ✅ USED

    const intervalId = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);


  const StatCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  }) => {
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.cardTitle}>{title}</Text>
          <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
            {icon}
          </View>
        </View>
        <Text style={styles.cardValue}>{value}</Text>
      </View>
    );
  };

  const onTechPress = (tech: any) => {


    setSelectedTech(tech);

    // clear old timer
    if (popupTimerRef.current) {

      clearTimeout(popupTimerRef.current);
    }

    // auto close after 1 min
    popupTimerRef.current = setTimeout(() => {

      setSelectedTech(null);
    }, 60 * 1000);


  };


  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Header />



        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Field Service Management Dashboard</Text>
            <Text style={styles.subtitle}>
              Real-time insights into your service operations
            </Text>
          </View>


        </View>

        {/* Stats */}
        <View style={styles.grid}>
          <StatCard
            title="Total Jobs"
            value={metrics?.job_metrics.total_jobs ?? 0}
            color="#3B82F6"
            icon={<Ionicons name="calendar-outline" size={18} color="#3B82F6" />}
          />

          <StatCard
            title="Completed Jobs"
            value={metrics?.job_metrics.completed_jobs ?? 0}
            color="#22C55E"
            icon={<Feather name="trending-up" size={18} color="#22C55E" />}
          />

          <StatCard
            title="Pending Jobs"
            value={metrics?.job_metrics.pending_jobs ?? 0}
            color="#FACC15"
            icon={<MaterialIcons name="warning-amber" size={18} color="#FACC15" />}
          />

          <StatCard
            title="Overdue Jobs"
            value={metrics?.job_metrics.overdue_jobs ?? 0}
            color="#EF4444"
            icon={<MaterialIcons name="error-outline" size={18} color="#EF4444" />}
          />

          <View style={[styles.statWrapper, styles.centerItem]}>
            <StatCard
              title="Active Technicians"
              value={metrics?.active_technicians ?? 0}
              color="#A855F7"
              icon={<Ionicons name="people-outline" size={18} color="#A855F7" />}
            />
          </View>

        </View>

        <Text style={styles.sectionTitle}>Live Technician Map</Text>

        <Pressable onPress={() => setMapOpen(true)}>
          <View style={styles.mapContainer}>
            <Mapbox.MapView style={styles.map} scrollEnabled={false} zoomEnabled={false}>
              {userLocation && (
                <Mapbox.Camera
                  centerCoordinate={[userLocation.longitude, userLocation.latitude]}
                  zoomLevel={zoom}
                />
              )}

              {/* USER ICON */}
              {userLocation && (
                <Mapbox.MarkerView
                  coordinate={[userLocation.longitude, userLocation.latitude]}
                  anchor={{ x: 0.5, y: 0.5 }}
                >
                  <View style={styles.userMarker}>
                    <Ionicons name="person" size={22} color="#fff" />
                  </View>
                </Mapbox.MarkerView>
              )}

              {/* TECHNICIANS */}
              {technicians.map((t) => (
                <Mapbox.MarkerView
                  key={`tech-${t.id}`}
                  coordinate={[t.current_location.longitude, t.current_location.latitude]}
                  anchor={{ x: 0.5, y: 0.5 }}
                >
                  <Pressable onPress={() => onTechPress(t)}>
                    <View
                      style={[
                        styles.marker,
                        { backgroundColor: statusColor(t.current_location.status) },
                      ]}
                    >
                      <Ionicons name="construct" size={20} color="#fff" />
                    </View>
                  </Pressable>
                </Mapbox.MarkerView>
              ))}

            </Mapbox.MapView>
            <View style={styles.statusLegend}>
              {[
                { label: 'IDLE', color: '#22C55E' },
                { label: 'TRAVELING SLOWLY', color: '#F59E0B' },
                { label: 'IN TRANSIT', color: '#3B82F6' },
                { label: 'HIGH SPEED', color: '#EF4444' },
              ].map((status) => (
                <View key={status.label} style={styles.legendRow}>
                  <View style={[styles.legendColor, { backgroundColor: status.color }]} />
                  <Text style={styles.legendLabel}>{status.label}</Text>
                </View>
              ))}
            </View>
            {/* Technician popup */}
            {selectedTech && (
              <View
                style={{
                  position: 'absolute',
                  left: Dimensions.get('window').width / 2 - 80, // center horizontally
                  top: 100, // adjust vertical position as needed
                  width: 160,
                  backgroundColor: '#E0D7FF',
                  padding: 8,
                  borderRadius: 8,
                  elevation: 5,
                  zIndex: 10,
                }}
              >
                <Text style={{ fontWeight: '700', marginBottom: 4 }}>
                  {selectedTech.technician_name}
                </Text>
                <Text>Status: {selectedTech.current_location.status}</Text>
                <Text>Speed: {selectedTech.current_location.speed} km/h</Text>

                <Pressable
                  onPress={() => setSelectedTech(null)}
                  style={{
                    marginTop: 6,
                    backgroundColor: '#A855F7',
                    borderRadius: 6,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ color: '#fff', textAlign: 'center' }}>Close</Text>
                </Pressable>
              </View>
            )}

          </View>
        </Pressable>

        <Modal visible={mapOpen} animationType="slide">
          <View style={styles.fullMapContainer}>
            <Pressable style={styles.closeBtn} onPress={() => setMapOpen(false)}>
              <Ionicons name="close" size={28} color="#000" />
            </Pressable>

            <Mapbox.MapView style={styles.fullMap}>
              {userLocation && (
                <Mapbox.Camera
                  ref={cameraRef}
                  centerCoordinate={[userLocation.longitude, userLocation.latitude]}
                  zoomLevel={zoom}
                />
              )}

              {/* USER ICON */}
              {userLocation && (
                <Mapbox.MarkerView
                  coordinate={[userLocation.longitude, userLocation.latitude]}
                  anchor={{ x: 0.5, y: 0.5 }}
                >
                  <View style={styles.userMarker}>
                    <Ionicons name="person" size={22} color="#fff" />
                  </View>
                </Mapbox.MarkerView>
              )}

              {/* TECHNICIANS */}
              {technicians.map((t) => (
                <Mapbox.MarkerView
                  key={`tech-${t.id}`}
                  coordinate={[t.current_location.longitude, t.current_location.latitude]}
                  anchor={{ x: 0.5, y: 0.5 }}
                >
                  <View>
                    <Pressable onPress={() => onTechPress(t)}>
                      <View
                        style={[
                          styles.marker,
                          { backgroundColor: statusColor(t.current_location.status) },
                        ]}
                      >
                        <Ionicons name="construct" size={20} color="#fff" />
                      </View>
                    </Pressable>

                    {/* Technician popup */}
                    {selectedTech?.id === t.id && (
                      <View
                        style={{
                          position: 'absolute',
                          bottom: 40, // offset above the marker
                          left: -75, // center horizontally
                          width: 160,
                          backgroundColor: '#E0D7FF',
                          padding: 8,
                          borderRadius: 8,
                          elevation: 5,
                        }}
                      >
                        <Text style={{ fontWeight: '700', marginBottom: 4 }}>
                          {t.technician_name} {/* or t.name if you have it */}
                        </Text>
                        <Text>Status: {t.current_location.status}</Text>
                        <Text>Speed: {t.current_location.speed} km/h</Text>

                        <Pressable
                          onPress={() => setSelectedTech(null)}
                          style={{
                            marginTop: 6,
                            backgroundColor: '#A855F7',
                            borderRadius: 6,
                            paddingVertical: 4,
                          }}
                        >
                          <Text style={{ color: '#fff', textAlign: 'center' }}>Close</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                </Mapbox.MarkerView>
              ))}
            </Mapbox.MapView>
            <View style={styles.statusLegend}>
              {[
                { label: 'IDLE', color: '#22C55E' },
                { label: 'TRAVELING SLOWLY', color: '#F59E0B' },
                { label: 'IN TRANSIT', color: '#3B82F6' },
                { label: 'HIGH SPEED', color: '#EF4444' },
              ].map((status) => (
                <View key={status.label} style={styles.legendRow}>
                  <View style={[styles.legendColor, { backgroundColor: status.color }]} />
                  <Text style={styles.legendLabel}>{status.label}</Text>
                </View>
              ))}
            </View>
            {/* ZOOM CONTROLS */}
            <View style={styles.zoomControls}>
              <Pressable
                style={styles.zoomBtn}
                onPress={() => {
                  const z = zoom + 1;
                  setZoom(z);
                  cameraRef.current?.setCamera({ zoomLevel: z });
                }}
              >
                <Ionicons name="add" size={24} />
              </Pressable>

              <Pressable
                style={styles.zoomBtn}
                onPress={() => {
                  const z = zoom - 1;
                  setZoom(z);
                  cameraRef.current?.setCamera({ zoomLevel: z });
                }}
              >
                <Ionicons name="remove" size={24} />
              </Pressable>
            </View>
          </View>
        </Modal>



        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {actions.map((a, i) => (
            <TouchableOpacity
              key={i}
              style={styles.actionItem}
              onPress={() =>
                navigation.navigate('Home', {
                  screen: a.screen,
                })
              }

            >
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
        {/* <Text style={styles.sectionTitle}>Recent Activities</Text>
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
        ))} */}



      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullMapContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fullMap: {
    flex: 1,
  },

  closeBtn: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
    elevation: 4,
  },

  zoomControls: {
    position: 'absolute',
    right: 20,
    bottom: 40,
  },
  zoomBtn: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 30,
    marginBottom: 10,
    elevation: 4,
  },
  centerItem: {
    width: "100%",
    alignItems: "center",
  },

  userMarker: {
    width: 36,
    height: 36,
    borderRadius: 19,
    backgroundColor: '#2ECC71', // user green
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },

  container: {

    backgroundColor: "#FFF",
    paddingHorizontal: 16,

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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
  bell: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    elevation: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statWrapper: {
    width: "48%",
    marginBottom: 16,
  },

  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 14,
    elevation: 2,
  },


  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 12,
    color: '#0F172A',
  },
  iconBox: {
    padding: 6,
    borderRadius: 8,
  },
  mapContainer: {
    width: Dimensions.get("window").width - 32,
    height: 400,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  map: { flex: 1 },


  markerText: { fontSize: 18 },
  cards: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },

  cardTitles: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },

  pipeline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  pill: {
    width: '30%',
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 12,
    alignItems: 'center',
  },


  techStatus: {
    fontSize: 9,
    color: "#0a0a0aff",
  },
  pillValue: {
    fontWeight: '700',
    fontSize: 14,
  },

  pillLabel: {
    fontSize: 12,
    marginTop: 4,
  },

  rows: {
    flexDirection: 'row',
    gap: 12,
  },

  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },

  revenueLabel: {
    marginLeft: 8,
    fontSize: 14,
  },

  revenueValue: {
    fontWeight: '700',
    fontSize: 16,
  },

  dollar: {
    fontSize: 18,
    fontWeight: '700',
  },

  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  inProgress: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  inProgressText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },

  alertRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },

  alertLabel: {
    fontSize: 14,
  },

  alertBadge: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  alertCount: {
    fontWeight: '700',
    fontSize: 12,
  },
  statusLegend: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 5,
    elevation: 5,
    zIndex: 10,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});
