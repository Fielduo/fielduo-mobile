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
  const [loading, setLoading] = useState(true);

  // ✅ Fetch trips on screen load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTrips();
        const mappedTrips: FieldWorkerTrip[] = (data || []).map(trip => ({
          id: trip.id,
          user_id: trip.user_id,               // ✅ add this
          user_name: trip.user_name,
          work_order_id: trip.work_order_id,   // ✅ add this
          work_order_name: trip.work_order_name,
          vehicle_id: trip.vehicle_id,         // ✅ add this
          vehicle_name: trip.vehicle_name,
          started_at: trip.started_at ?? "",   // Ensure string
          ended_at: trip.ended_at ?? "",       // Ensure string
        }));


        setTrips(mappedTrips);
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to fetch trips");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  const handleCardPress = (trip: FieldWorkerTrip) => {
    navigation.navigate("CreateFieldWorkerTrip", {
      mode: "view",
      trip, // Pass the full trip object
    });
  };


  const handleCreateNew = () => {
    navigation.navigate("CreateFieldWorkerTrip", { mode: "create" });
  };

  const renderTripCard = ({ item }: { item: FieldWorkerTrip }) => (
    <TouchableOpacity onPress={() => handleCardPress(item)}>
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
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <Header />
      <HeaderSection
        title="What services do you need?"
        buttonText="+ New Trip"
        onButtonClick={handleCreateNew}
        onSearchChange={(text) => console.log("Searching:", text)}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.subTitle}>FSM</Text>
        <Text style={styles.title}>Field Worker Trip</Text>

        {/* ✅ Items count & last updated */}
        {!loading && (
          <Text style={styles.metaText}>
            {trips.length} {trips.length === 1 ? "item" : "items"} • Updated just now
          </Text>
        )}
      </View>

      {/* 🔹 Loading State */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text> Fetching trips...</Text>
        </View>
      ) : trips.length === 0 ? (
        // 🔹 Empty State
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            No trips found. Click “New Trip” to create one.
          </Text>
        </View>
      ) : (
        // 🔹 Data List
        <FlatList
          data={trips}
          keyExtractor={(item, index) => item.id || String(index)}
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
});
