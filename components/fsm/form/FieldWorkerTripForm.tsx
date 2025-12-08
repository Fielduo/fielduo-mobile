import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  TextInput,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import FormHeader from "../../common/FormHeader";
import SearchDropdown from "../../common/searchDropdown";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { createTrip, deleteTrip, searchUsers, searchVehicles, searchWorkOrders, updateTrip } from "@/src/api/auth";
import { Ionicons } from "@expo/vector-icons";


type CreateFieldWorkerTripRouteProp = RouteProp<
  SearchMenuStackParamList,
  "CreateFieldWorkerTrip"
>;

interface Option {
  label: string;
  id: string;
}

// Define a payload type matching API expectations
interface TripPayload {
  user_id: string;
  work_order_id: string;
  vehicle_id: string;
  started_at: string;
  ended_at: string;
}

export default function CreateFieldWorkerTrip() {
  const navigation =
    useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();
  const route = useRoute<CreateFieldWorkerTripRouteProp>();
  const { mode = "create", trip } = route.params || {};

  const [user, setUser] = useState<string>("");
  const [workOrder, setWorkOrder] = useState<string>("");
  const [vehicle, setVehicle] = useState<string>("");
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [endedAt, setEndedAt] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [userResults, setUserResults] = useState<Option[]>([]);
  const [workOrderResults, setWorkOrderResults] = useState<Option[]>([]);
  const [vehicleResults, setVehicleResults] = useState<Option[]>([]);

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  // === Load existing trip data ===
  useEffect(() => {
    if (trip) {
      setUser(trip.user_id);
      setWorkOrder(trip.work_order_id);
      setVehicle(trip.vehicle_id);

      setUserResults([{ id: trip.user_id, label: trip.user_name }]);
      setWorkOrderResults([{ id: trip.work_order_id, label: trip.work_order_name }]);
      setVehicleResults([{ id: trip.vehicle_id, label: trip.vehicle_name }]);

      setStartedAt(trip.started_at ? new Date(trip.started_at) : null);
      setEndedAt(trip.ended_at ? new Date(trip.ended_at) : null);
    }
  }, [trip]);


  // === Search Handlers ===
  const handleSearchUser = async (query: string) => {
    if (!query.trim()) return;
    try {
      const res = (await searchUsers(query)) as { id: string; first_name: string }[];
      setUserResults(res.map(u => ({ label: u.first_name, id: u.id })));
    } catch (error) {
      console.error("Error searching users:", error);
      setUserResults([]);
    }
  };

  const handleSearchWorkOrder = async (query: string) => {
    if (!query.trim()) return setWorkOrderResults([]);
    try {
      const res = (await searchWorkOrders(query)) as { id: string; name: string }[];
      setWorkOrderResults(res.map(w => ({ label: w.name, id: w.id })));
    } catch (error) {
      console.error("Error searching work orders:", error);
      setWorkOrderResults([]);
    }
  };

  const handleSearchVehicle = async (query: string) => {
    if (!query.trim()) return setVehicleResults([]);
    try {
      const res = (await searchVehicles(query)) as { id: string; type: string }[];
      setVehicleResults(res.map(v => ({ label: v.type, id: v.id })));
    } catch (error) {
      console.error("Error searching vehicles:", error);
      setVehicleResults([]);
    }
  };


  const handleSaveTrip = async () => {
    if (!user || !workOrder || !vehicle || !startedAt || !endedAt) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    const payload: TripPayload = {
      user_id: user,
      work_order_id: workOrder,
      vehicle_id: vehicle,
      started_at: startedAt.toISOString(),
      ended_at: endedAt.toISOString(),
    };

    try {
      if (isEditMode && trip?.id) {
        await updateTrip(trip.id, payload);
        Alert.alert("Success", "Trip updated successfully!");
      } else {
        await createTrip(payload);
        Alert.alert("Success", "Trip created successfully!");
      }
      navigation.goBack();
    } catch (error: any) {
      console.error("Error saving trip:", error);
      Alert.alert("Error", error.message || "Failed to save trip.");
    }
  };

  // === Delete Trip ===
  const handleDelete = async () => {
    if (!trip?.id) return;
    Alert.alert("Confirm", "Are you sure you want to delete this trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTrip(String(trip.id));
            Alert.alert("Deleted", "Trip deleted successfully!");
            navigation.goBack();
          } catch (error: any) {
            console.error("Error deleting trip:", error);
            Alert.alert("Error", "Failed to delete trip.");
          }
        },
      },
    ]);
  };

  // === Date Pickers ===
  const onStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowStartPicker(false);
    if (selectedDate) setStartedAt(selectedDate);
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowEndPicker(false);
    if (selectedDate) setEndedAt(selectedDate);
  };

  const handleCancel = () => navigation.goBack();

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FormHeader
        title={
          isViewMode
            ? "View Field Worker Trip"
            : isEditMode
              ? "Edit Field Worker Trip"
              : "Create Field Worker Trip"
        }
        subtitle={
          isViewMode
            ? "Trip details"
            : isEditMode
              ? "Update your trip details"
              : "Create a New Worker Trip"
        }
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>
            {isViewMode ? "View Trip" : "Trip Details"}
          </Text>

          {isViewMode && (
            <TouchableOpacity
              style={styles.editSmallButton}
              onPress={() =>
                navigation.navigate("CreateFieldWorkerTrip", { mode: "edit", trip })
              }
            >
              <Ionicons name="create-outline" size={16} color="#fff" />
              <Text style={styles.editSmallButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {isViewMode ? (
          <View style={styles.readOnlyView}>
            <Text style={styles.label}>User</Text>
            <Text style={styles.readOnlyText}>
              {userResults.find(u => u.id === user)?.label || "-"}
            </Text>
          </View>
        ) : (
          <SearchDropdown
            label="User *"
            placeholder="Search user"
            value={userResults.find(u => u.id === user)?.label || ""}
            data={userResults.map(r => r.label)}
            onSelect={selectedLabel => {
              const selected = userResults.find(r => r.label === selectedLabel);
              setUser(selected?.id || "");
            }}
            editable={!isViewMode}
            onSearch={handleSearchUser}
          />
        )}


        {isViewMode ? (
          <View style={styles.readOnlyView}>
            <Text style={styles.label}>Work Order</Text>
            <Text style={styles.readOnlyText}>
              {workOrderResults.find(w => w.id === workOrder)?.label || "-"}
            </Text>
          </View>
        ) : (
          <SearchDropdown
            label="Work Order *"
            placeholder="Search work order"
            value={workOrderResults.find(w => w.id === workOrder)?.label || ""}
            data={workOrderResults.map(r => r.label)}
            onSelect={selectedLabel => {
              const selected = workOrderResults.find(r => r.label === selectedLabel);
              setWorkOrder(selected?.id || "");
            }}
            editable={!isViewMode}
            onSearch={handleSearchWorkOrder}
          />
        )}

        {/* === Vehicle Dropdown === */}

        {isViewMode ? (
          <View style={styles.readOnlyView}>
            <Text style={styles.label}>Vehicle</Text>
            <Text style={styles.readOnlyText}>
              {vehicleResults.find(v => v.id === vehicle)?.label || "-"}
            </Text>
          </View>
        ) : (
          <SearchDropdown
            label="Vehicle *"
            placeholder="Search vehicle"
            value={vehicleResults.find(v => v.id === vehicle)?.label || ""}
            data={vehicleResults.map(r => r.label)}
            onSelect={selectedLabel => {
              const selected = vehicleResults.find(r => r.label === selectedLabel);
              setVehicle(selected?.id || "");
            }}
            editable={!isViewMode}
            onSearch={handleSearchVehicle}
          />
        )}

        {/* === Started At === */}
        <Text style={styles.label}>Started At *</Text>
        {isViewMode ? (
          <View style={styles.readOnlyView}>
            <Text style={styles.readOnlyText}>{startedAt ? startedAt.toLocaleString() : ""}</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => !isViewMode && setShowStartPicker(true)}
            activeOpacity={isViewMode ? 1 : 0.7}
          >
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Select start date"
                value={startedAt ? startedAt.toLocaleString() : ""}
                editable={false}
                style={[styles.input, isViewMode && styles.readOnlyInput]}
              />
              <Ionicons
                name="calendar-outline"
                size={18}
                color="#777"
                style={styles.iconRight}
              />
            </View>
          </TouchableOpacity>
        )}
        {showStartPicker && (
          <DateTimePicker
            value={startedAt || new Date()}
            mode={Platform.OS === "ios" ? "datetime" : "date"} // ✅ fixed
            display={Platform.OS === "ios" ? "spinner" : "calendar"} // ✅ safe for Android
            onChange={onStartDateChange}
          />
        )}

        {/* === Ended At === */}
        <Text style={styles.label}>Ended At *</Text>
        {isViewMode ? (
          <View style={styles.readOnlyView}>
            <Text style={styles.readOnlyText}>{endedAt ? endedAt.toLocaleString() : ""}  </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => !isViewMode && setShowEndPicker(true)}
            activeOpacity={isViewMode ? 1 : 0.7}
          >
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Select end date"
                value={endedAt ? endedAt.toLocaleString() : ""}
                editable={false}
                style={[styles.input, isViewMode && styles.readOnlyInput]}
              />
              <Ionicons
                name="calendar-outline"
                size={18}
                color="#777"
                style={styles.iconRight}
              />
            </View>
          </TouchableOpacity>
        )}
        {showEndPicker && (
          <DateTimePicker
            value={endedAt || new Date()}
            mode={Platform.OS === "ios" ? "datetime" : "date"} // ✅ fixed
            display={Platform.OS === "ios" ? "spinner" : "calendar"} // ✅ safe for Android
            onChange={onEndDateChange}
          />
        )}


        {/* === Buttons === */}
        {!isViewMode && (
          <View style={{ marginTop: 40 }}>   {/* 👈 added here */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveTrip}>
              <Text style={styles.saveButtonText}>
                {isEditMode ? "Update Trip" : "Save Trip"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: "#00A86B" }]}
              onPress={handleSaveTrip}
            >
              <Text style={styles.saveButtonText}>Save & New</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
        {isViewMode && (
          <View style={{ marginTop: 100 }}>

            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, backgroundColor: "#fff" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
    marginTop: 8,
  },
  header: { fontSize: 16, fontWeight: "600", color: "#222" },
  editSmallButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C95F9",
    paddingVertical: 6,
    paddingHorizontal: 25,
    borderRadius: 5,
  },
  editSmallButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 4,
    fontSize: 13,
  },
  label: {
    color: "#6234E2",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 5,
    marginBottom: 14,
    paddingHorizontal: 10,
  },
  icon: { marginRight: 6 },
  iconRight: { marginLeft: 6 },
  input: { flex: 1, paddingVertical: 10, color: "#333" },
  saveButton: {
    backgroundColor: "#6234E2",
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtn: {
    paddingVertical: 12,
    borderRadius: 5,
    marginBottom: 10,
    marginTop: 16,
    alignItems: "center",
  },
  deleteButton: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },

  deleteButtonText: {
    color: "#FF1C1C",
    fontWeight: "700",
    fontSize: 16,
  },

  cancelButton: {
    backgroundColor: "#555",
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: { color: "#FFF", fontWeight: "600", fontSize: 15 },
  cancelText: { color: "#FFF", fontWeight: "600", fontSize: 15 },
  systemInfo: {
    marginBottom: 10,
    padding: 12,

  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  infoBox: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B46F6",
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 6,
  },
  infoValue: {
    fontSize: 14,
    color: "#111",
  },
  readOnlyInput: {

    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 12,
    color: "#101318CC",

  },
  readOnlyView: {
    paddingVertical: 14,
    paddingHorizontal: 12,

  },
  readOnlyText: {
    fontSize: 12,
    color: "#101318CC",
  },
});