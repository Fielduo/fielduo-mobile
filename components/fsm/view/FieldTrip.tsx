import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import Header from "../../common/Header";
import HeaderSection from "../../common/HeaderSection";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { getTrips } from "@/src/api/auth";
import { Ionicons } from "@expo/vector-icons";
import SwipeCard from "@/components/common/SwipeCard";

interface FieldWorkerTrip {
  id: string;
  user_id: string;
  user_name: string;
  work_order_id: string;
  work_order_name: string;
  vehicle_id: string;
  vehicle_name: string;
  started_at: string;
  ended_at: string;
}

export default function FieldWorkerTrip() {
  const navigation =
    useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();

  const [trips, setTrips] = useState<FieldWorkerTrip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<FieldWorkerTrip[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "recent">("all");

  const [recentTripIds, setRecentTripIds] = useState<string[]>([]);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTrips();
        const mappedTrips: FieldWorkerTrip[] = (data || []).map((trip) => ({
          id: trip.id,
          user_id: trip.user_id,
          user_name: trip.user_name,
          work_order_id: trip.work_order_id,
          work_order_name: trip.work_order_name,
          vehicle_id: trip.vehicle_id,
          vehicle_name: trip.vehicle_name,
          started_at: trip.started_at ?? "",
          ended_at: trip.ended_at ?? "",
        }));

        setTrips(mappedTrips);
        setFilteredTrips(mappedTrips);
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to fetch trips");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ---------------- DIRECT SEARCH (ALL FIELDS) ---------------- */
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredTrips(trips);
      return;
    }

    const text = searchText.toLowerCase();

    const result = trips.filter((trip) =>
      Object.values(trip).some((value) =>
        value ? value.toString().toLowerCase().includes(text) : false
      )
    );

    setFilteredTrips(result);
  }, [searchText, trips]);

  /* ---------------- RECENT / ALL VIEW ---------------- */
  const displayTrips =
    viewMode === "all"
      ? filteredTrips
      : filteredTrips.filter((trip) =>
        recentTripIds.includes(trip.id)
      );

  /* ---------------- ACTIONS ---------------- */
  const handleCreateNew = () => {
    navigation.navigate("CreateFieldWorkerTrip", { mode: "create" });
  };

  const handleCardPress = (trip: FieldWorkerTrip) => {
    setRecentTripIds((prev) => {
      const updated = [trip.id, ...prev.filter((id) => id !== trip.id)];
      return updated.slice(0, 20);
    });

    navigation.navigate("CreateFieldWorkerTrip", {
      mode: "view",
      trip,
    });
  };

  /* ---------------- CARD UI ---------------- */
 const renderTripCard = ({ item }: { item: FieldWorkerTrip }) => (
  <SwipeCard
    onEdit={() =>
      navigation.navigate("CreateFieldWorkerTrip", {
        mode: "edit",
        trip: item,
      })
    }
    onView={() => {
      // 🔥 add to recent viewed
      setRecentTripIds((prev) => {
        const updated = [item.id, ...prev.filter((id) => id !== item.id)];
        return updated.slice(0, 20);
      });

      navigation.navigate("CreateFieldWorkerTrip", {
        mode: "view",
        trip: item,
      });
    }}
  >
    <View style={styles.card}>
        <View style={styles.content}>
          <View style={styles.row}>
            <View style={styles.columnLeft}>
              <Text style={styles.label}>User</Text>
              <Text style={styles.value}>{item.user_name}</Text>
            </View>
            <View style={styles.columnRight}>
              <Text style={styles.label}>Started At</Text>
              <Text style={styles.valueRight}>{item.started_at}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.columnLeft}>
              <Text style={styles.label}>Work Order</Text>
              <Text style={styles.value}>{item.work_order_name}</Text>
            </View>
            <View style={styles.columnRight}>
              <Text style={styles.label}>Ended At</Text>
              <Text style={styles.valueRight}>{item.ended_at}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.columnLeft}>
              <Text style={styles.label}>Vehicle</Text>
              <Text style={styles.value}>{item.vehicle_name}</Text>
            </View>
          </View>
        </View>
      </View>
     </SwipeCard>
  );

  /* ---------------- UI ---------------- */
  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <Header />

      <HeaderSection
        title="What services do you need?"
        buttonText="+ New Trip"
        onButtonClick={handleCreateNew}
        searchValue={searchText}
        onSearchChange={setSearchText}
      />

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.subTitle}>FSM</Text>
          <Text style={styles.title}>Field Worker Trip</Text>
          {!loading && (
            <Text style={styles.metaText}>
              {trips.length} items • Updated just now
            </Text>
          )}
        </View>

        <View style={{ position: "relative" }}>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setDropdownOpen((p) => !p)}
          >
            <Text>
              {viewMode === "all" ? "All" : "Recently Viewed"}
            </Text>
            <Ionicons name="chevron-down-outline" size={16} />
          </TouchableOpacity>

          {dropdownOpen && (
            <View style={styles.dropdown}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setViewMode("all");
                  setDropdownOpen(false);
                }}
              >
                <Text>All</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setViewMode("recent");
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
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : displayTrips.length === 0 ? (
        <View style={styles.center}>
          <Text>No trips found</Text>
        </View>
      ) : (
        <FlatList
          data={displayTrips}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderTripCard}
          contentContainerStyle={{ padding: 12 }}
        />

      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 6,
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  subTitle: {
    color: "#6234E2",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#101318" },
  metaText: {
    fontSize: 13,
    color: "#555",
    marginTop: 4,
  },
  content: { padding: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  columnLeft: { flex: 1 },
  columnRight: { flex: 1, alignItems: "flex-start" },
  label: { fontSize: 10, color: "#6234E2", fontWeight: "500", marginBottom: 3 },
  value: { fontSize: 12, color: "#101318CC", fontWeight: "600" },
  valueRight: { fontSize: 12, color: "#101318CC", fontWeight: "500" },
  sectionHeader: { paddingHorizontal: 16, paddingTop: 10, backgroundColor: "#FFF" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginBottom: 20,
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
