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

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";



export default function Vehicles() {
  const navigation = useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
 
  type ViewMode = 'all' | 'recent';

  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
const [recentIds, setRecentIds] = useState<string[]>([]);
const loadRecentVehicles = async () => {
  const stored = await AsyncStorage.getItem('recent_vehicles');
  setRecentIds(stored ? JSON.parse(stored) : []);
};
useEffect(() => {
  loadRecentVehicles();
}, [viewMode]);

  //  Fetch vehicles from API
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getAll(); //  returns Vehicle[]
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

  //  Filter by search
const filteredVehicles = vehicles.filter((v: Vehicle) => {
  const matchesSearch =
    v.plate_number.toLowerCase().includes(searchText.toLowerCase()) ||
    v.model.toLowerCase().includes(searchText.toLowerCase()) ||
    v.type.toLowerCase().includes(searchText.toLowerCase());

  if (!matchesSearch) return false;

  if (viewMode === "recent") {
    return recentIds.includes(v.id);
  }

  return true;
});




const handleVehiclePress = async (vehicle: Vehicle) => {
  try {
    const key = 'recent_vehicles';
    const stored = await AsyncStorage.getItem(key);
    const recent: string[] = stored ? JSON.parse(stored) : [];

    // already exists → remove
    const updated = recent.filter(id => id !== vehicle.id);

    // add to top
    updated.unshift(vehicle.id);

    // limit to last 10
    await AsyncStorage.setItem(key, JSON.stringify(updated.slice(0, 10)));

    navigation.navigate("VehicleForm", { mode: "view", vehicle });
  } catch (e) {
    console.log('Recent save error', e);
  }
};

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <Header />

    <HeaderSection
  title="What services do you need?"
  buttonText="+ New Vehicle"
  onButtonClick={() => navigation.navigate("VehicleForm", { mode: "create" })}
  searchValue={searchText}
  onSearchChange={setSearchText}
/>

      <View style={styles.headerRow}>
        <View style={styles.sectionHeader}>
          <Text style={styles.subTitle}>FSM</Text>
          <Text style={styles.title}>Vehicle</Text>
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
               onPress={() => handleVehiclePress(vehicle)}
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
    flex: 1
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
