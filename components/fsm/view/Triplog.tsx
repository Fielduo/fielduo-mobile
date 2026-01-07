import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Header from "../../common/Header";
import HeaderSection from "../../common/HeaderSection";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { Ionicons } from "@expo/vector-icons";
import { fetchTrips, fetchTripStatusesFromAPI } from "@/database/local/triplog";

type NavigationProp =
  NativeStackNavigationProp<SearchMenuStackParamList, "TripLog">;

type Trip = {
  id: string;
  trip_id?: string;
  timestamp: number;
  latitude: string | number;
  longitude: string | number;
  job_status_id?: string;
  work_order_number?: string;
  site_name?: string;
};

type TripStatus = { id: string; name: string };
type ViewMode = "all" | "recent";

export default function TripLog() {
  const navigation = useNavigation<NavigationProp>();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [tripStatuses, setTripStatuses] = useState<TripStatus[]>([]);

  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);

  // =========================
  // Load Trips
  // =========================
  useEffect(() => {
    const loadTrips = async () => {
      setLoading(true);
      try {
        const res = await fetchTrips();
        const normalized = (res.data || []).map((t: any) => ({
          ...t,
          timestamp: t.timestamp
            ? new Date(t.timestamp).getTime()
            : Date.now(),
        }));
        setTrips(normalized);
        setOfflineMode(res.offline);
      } catch {
        setTrips([]);
        setOfflineMode(true);
      } finally {
        setLoading(false);
      }
    };
    loadTrips();
  }, []);

  // Load Statuses
  useEffect(() => {
    fetchTripStatusesFromAPI().then(setTripStatuses);
  }, []);

  const getStatusName = (id?: string | number) => {
    if (!id) return "";
    const found = tripStatuses.find((s) => s.id === id.toString());
    return found ? found.name : id.toString();
  };

  // =========================
  // 🔍 SEARCH + VIEW MODE
  // =========================
  const displayedTrips = trips
    .filter((trip) =>
      viewMode === "recent"
        ? recentTrips.some((t) => t.id === trip.id)
        : true
    )
    .filter((trip) => {
      if (!searchText.trim()) return true;

      const text = searchText.toLowerCase();
      return (
        trip.trip_id?.toLowerCase().includes(text) ||
        trip.work_order_number?.toLowerCase().includes(text) ||
        trip.site_name?.toLowerCase().includes(text) ||
        getStatusName(trip.job_status_id).toLowerCase().includes(text) ||
        `${trip.latitude},${trip.longitude}`.toLowerCase().includes(text)
      );
    });

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />

      {/* 🔍 DIRECT SEARCH */}
      <HeaderSection
        title="Trip Logs"
        buttonText="+ New Logs"
        onButtonClick={() =>
          navigation.navigate("TripLogForm", { mode: "create" })
        }
        searchValue={searchText}
        onSearchChange={setSearchText}
      />

      <ScrollView style={styles.container}>
         {
    offlineMode && (
      <Text style={{ color: "red", fontSize: 12, marginBottom: 10 }}>
        Offline mode - Showing last 14 days trip logs only
      </Text>
    )
  }

        {/* Header */}
        <View style={styles.headerRow}>
          <View>
              <Text style={styles.subTitle}>FSM</Text>
            <Text style={styles.headerTitle}>Trip Logs</Text>
            <Text style={styles.headerMeta}>
              {displayedTrips.length} logs • Updated just now
            </Text>
          </View>

       <View style={{ position: 'relative' }}>
            <TouchableOpacity
              style={styles.filterBtn}
              onPress={() => setDropdownOpen((prev) => !prev)}
            >
              <Text style={styles.filterText}>
                {viewMode === 'all' ? 'All' : 'Recently Viewed'}
              </Text>
              <Ionicons name="chevron-down-outline" size={16} color="#444" />
            </TouchableOpacity>

            {dropdownOpen && (
              <View style={styles.dropdown}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setViewMode('all');
                    setDropdownOpen(false);
                  }}
                >
                  <Text>All</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setViewMode('recent');
                    setDropdownOpen(false);
                  }}
                >
                  <Text>Recently Viewed</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#6B4EFF" />
        ) : (
          displayedTrips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={styles.card}
              onPress={() => {
                setRecentTrips((prev) => {
                  const updated = [
                    trip,
                    ...prev.filter((t) => t.id !== trip.id),
                  ];
                  return updated.slice(0, 20);
                });

                navigation.navigate("TripLogForm", {
                  mode: "view",
                  data: trip,
                });
              }}
            >
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.label}>Trip ID</Text>
                  <Text style={styles.value}>{trip.trip_id || "-"}</Text>
                </View>
                <View>
                  <Text style={styles.label}>Date</Text>
                  <Text style={styles.value}>
                    {new Date(trip.timestamp).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.smallLabel}>Work Order</Text>
                  <Text style={styles.smallValue}>
                    {trip.work_order_number || "-"}
                  </Text>
                </View>

                <View>
                  <Text style={styles.smallLabel}>Site</Text>
                  <Text style={styles.smallValue}>
                    {trip.site_name ||
                      `${trip.latitude}, ${trip.longitude}`}
                  </Text>
                </View>

                <View>
                  <Text style={styles.smallLabel}>Status</Text>
                  <Text style={styles.smallValue}>
                    {getStatusName(trip.job_status_id)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

      </ScrollView>
    </View>
  );
}




const styles = StyleSheet.create({
  container: {
    padding: 12,
    paddingBottom: 90,
  },
  header: {
    marginBottom: 0,
  },
  headerTag: {
    color: "#6B4EFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#101318",
  },
  headerMeta: {
    marginTop: 6,
    color: "#535351CC",
    fontSize: 10,

  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
    marginTop: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 50,
  },
  thirdCol: {
    flex: 1,
  },
  label: {
    color: "#6B4EFF",
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 4,
  },
  value: {
    color: "#111827",
    fontSize: 11,
    fontWeight: "700",
  },
  smallLabel: {
    color: "#6B4EFF",
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 4,
  },
  smallValue: {
    color: "#333",
    fontSize: 11,
    fontWeight: "600",
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#FFF',
  },



  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    height: 36,
    minWidth: 170,
    paddingHorizontal: 12,

    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    backgroundColor: '#fff',
  },


  filterText: {
    fontSize: 14,
    marginRight: 6,
    color: "#6C3EB5",

    fontWeight: "700",
  },
  dropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    width: 160,
    zIndex: 999,
    elevation: 4,
  },

  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },


  dropdownText: {
    color: "#212121",
    fontSize: 13,
    fontWeight: "500",
  },
    subTitle: {
    color: "#6234E2",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,

  },
});
