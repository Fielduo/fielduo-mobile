// E:\fielduo-mobile\src\components\fsm\view\Vehicles.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import HeaderSection from "../../common/HeaderSection";
import Header from "../../common/Header";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { Vehicle } from "@/types/Worker";
import { vehicleService } from "@/src/api/auth";





export default function Vehicles() {
  const navigation = useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  // ✅ Fetch vehicles from API
 const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getAll(); // ✅ returns Vehicle[]
      setVehicles(data);
    } catch (error: any) {
      console.error("Error fetching vehicles:", error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchVehicles();
  }, []);

  // ✅ Filter by search
  const filteredVehicles = vehicles.filter(
    (v) =>
      v.plate_number.toLowerCase().includes(searchText.toLowerCase()) ||
      v.model.toLowerCase().includes(searchText.toLowerCase()) ||
      v.type.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <Header />

      <HeaderSection
        title="What services do you need?"
        buttonText="+ New Vehicle"
        onButtonClick={() => navigation.navigate("VehicleForm", { mode: "create" })}
        onSearchChange={setSearchText}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.subTitle}>FSM</Text>
        <Text style={styles.title}>Vehicle</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Loading vehicles...</Text>
        </View>
      ) : (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {filteredVehicles.length === 0 ? (
            <Text style={{ textAlign: "center", marginTop: 20 }}>No vehicles found.</Text>
          ) : (
            filteredVehicles.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                style={styles.card}
                onPress={() => navigation.navigate("VehicleForm", { mode: "view", vehicle })}
              >
                <View style={styles.row}>
                  <View style={styles.col}>
                    <Text style={styles.label}>Plate Number</Text>
                    <Text style={styles.value}>{vehicle.plate_number}</Text>
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.label}>GPS Device</Text>
                    <Text style={styles.value}>{vehicle.gps_device_id || "-"}</Text>
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.col}>
                    <Text style={styles.label}>Model</Text>
                    <Text style={styles.value}>{vehicle.model}</Text>
                  </View>
                  
  <View style={styles.col}>
    <Text style={styles.label}>Status</Text>
    <View
      style={[
        styles.statusBadge,
        vehicle.status.toLowerCase() === "active"
          ? styles.active
          : styles.inactive,
      ]}
    >
      <Text style={styles.statusText}>{vehicle.status}</Text>
    </View>
  </View>


                </View>

                <View style={styles.row}>
                  <View style={styles.col}>
                    <Text style={styles.label}>Type</Text>
                    <Text style={styles.value}>{vehicle.type}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "#FFF",
  },
  subTitle: {
    color: "#6234E2",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#101318",

  },
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 5,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  col: { flex: 1 },
  label: { fontSize: 13, fontWeight: "600", color: "#6B4EFF", marginBottom: 2 },
  value: { fontSize: 14, color: "#222" },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 2,
  },
  active: { backgroundColor: "#00A78E" },
  inactive: { backgroundColor: "#E53935" },
  statusText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
});
