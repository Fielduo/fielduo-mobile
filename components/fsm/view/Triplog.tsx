import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import Header from "../../common/Header";
import HeaderSection from "../../common/HeaderSection";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { api } from "@/src/api/cilent";
import FilterModal, { AppliedFilter } from "@/components/common/FilterModal";
import { Ionicons } from "@expo/vector-icons";


type Trip = {
  id: string;
  trip_id?: string;
  timestamp: string;

  latitude: string | number;
  longitude: string | number;

  job_status_id?: string;


  work_order_number?: string;
  site_name?: string;

};


type NavigationProp = NativeStackNavigationProp<SearchMenuStackParamList, "TripLog">;
type TripStatus = { id: number; name: string };

export default function TripLog() {
  const navigation = useNavigation<NavigationProp>();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterVisible, setFilterVisible] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState<AppliedFilter | null>(null);

  const [tripStatuses, setTripStatuses] = useState<TripStatus[]>([]);
const [dropdownOpen, setDropdownOpen] = useState(false);
const [viewMode, setViewMode] = useState<'all' | 'recent'>('all');
const [recentlyViewedTrips, setRecentlyViewedTrips] = useState<Trip[]>([]);


  const fetchTrips = async () => {

    try {
      setLoading(true);
      const data = await api.get<Trip[]>("/trip_logs");

      setTrips(data || []);

    } catch (err: any) {
      console.error("❌ Error fetching trip logs:", err.response?.data || err);

      if (err.response?.status === 401) {
        console.warn("⚠️ Session expired. Redirecting to login...");
        Alert.alert("Session expired", "Please login again.");
      } else {
        console.warn("⚠️ Unable to fetch trip logs. Showing alert.");
        Alert.alert("Error", "Unable to fetch trip logs");
      }

    } finally {
      setLoading(false);
      console.log("⏹️ Fetch trips finished. Loading set to false");
    }
  };

  const fetchTripStatuses = async () => {
    try {
      const data = await api.get<TripStatus[]>("/triplog_statuses");

      setTripStatuses(data || []);
    } catch (err: any) {
      console.error("❌ Error fetching trip statuses:", err.response?.data || err);
    }
  };


  useEffect(() => {
    fetchTripStatuses();
    fetchTrips();
  }, []);
  const filteredTrips = trips.filter((trip) => {
    if (!appliedFilter || !appliedFilter.field) return true;

    const rawValue = trip[appliedFilter.field as keyof Trip];
    if (!rawValue) return false;

    return rawValue.toString().toLowerCase().includes(appliedFilter.value.toLowerCase());
  });
const displayedTrips = trips.filter((trip) => {
  // 1️⃣ Filter by appliedFilter
  let matchesFilter = true;
  if (appliedFilter?.field) {
    const rawValue = trip[appliedFilter.field as keyof Trip];
    matchesFilter = rawValue
      ? rawValue.toString().toLowerCase().includes(appliedFilter.value.toLowerCase())
      : false;
  }

  // 2️⃣ Filter by viewMode
  let matchesViewMode = true;
  if (viewMode === 'recent') {
    matchesViewMode = recentlyViewedTrips.some((t) => t.id === trip.id);
  }

  return matchesFilter && matchesViewMode;
});


  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />
      <HeaderSection
        title="What services do you need?"
        buttonText="+ New Logs"
        onButtonClick={() => navigation.navigate("TripLogForm", { mode: "create" })}

        onSearchPress={() => setFilterVisible(true)} // 🔹 Open filter
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
  <View style={styles.headerRow}>
        <View style={styles.header}>
          <Text style={styles.headerTag}>FSM</Text>
          <Text style={styles.headerTitle}>Trip Logs</Text>
          <Text style={styles.headerMeta}>{trips.length} logs - Updated just now</Text>
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
  // Mark this trip as recently viewed
  setRecentlyViewedTrips((prev) => {
    const alreadyViewed = prev.find((t) => t.id === trip.id);
    if (alreadyViewed) return prev;
    return [trip, ...prev].slice(0, 20); // Keep last 20
  });

  navigation.navigate("TripLogForm", { mode: "view", data: trip });
}}

            >
              {/* Trip ID + Date */}
              <View style={styles.rowBetween}>
                <View style={{ flex: 3 }}>
                  <Text style={styles.label}>Trip ID</Text>
                  <Text style={styles.value}>{trip.trip_id || "-"}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Date</Text>
                  <Text style={styles.value}>
                    {new Date(trip.timestamp).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {/* Work Order + Site + Status */}
              <View style={styles.rowBetween}>
                <View style={styles.thirdCol}>
                  <Text style={styles.smallLabel}>Work Order</Text>
                  <Text style={styles.smallValue}>{trip.work_order_number || "-"}</Text>
                </View>

                <View style={styles.thirdCol}>
                  <Text style={styles.smallLabel}>Site</Text>
                  <Text style={styles.smallValue}>
                    {trip.site_name || `${trip.latitude}, ${trip.longitude}`}
                  </Text>
                </View>

                <View style={styles.thirdCol}>
                  <Text style={styles.smallLabel}>Status</Text>
                  <Text style={styles.smallValue}>
                    {trip.job_status_id
                      ? tripStatuses.find((s) => String(s.id) === trip.job_status_id)?.name ?? trip.job_status_id
                      : "-"}
                  </Text>

                </View>
              </View>



            </TouchableOpacity>

          ))
        )}

        <FilterModal
          visible={filterVisible}
          module="trip_logs" // pick the right module for filtering TripLogs
          onClose={() => setFilterVisible(false)}
          onApply={(filter) => {
            setAppliedFilter(filter);
            setFilterVisible(false);
          }}
        />

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 21,
    paddingBottom: 40,
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
});
