import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import FormHeader from "../../common/FormHeader";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAuthStore } from "../../../store/useAuthStore";
import { api } from "@/src/api/cilent";
import { searchAssets, searchCustomers, searchUsers } from "@/src/api/workorder";
import { Ionicons } from "@expo/vector-icons";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { WorkOrder } from "@/types/Worker";


interface DropdownOption {
  id: string;   // UUID from backend
  name: string; // display name
}

interface Vehicle {
  id: number | string;
  name: string;
}

// ✅ Route type
type CreateWorkorderRouteProp = RouteProp<SearchMenuStackParamList, "CreateWorkorder">;

export default function CreateWorkOrderForm() {
  const navigation = useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();
  const route = useRoute<CreateWorkorderRouteProp>();

  const { mode = "create", workorder } = route.params || {} as {
    mode?: string;
    workorder?: WorkOrder;
  };

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  // --- Form states ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [schedule, setSchedule] = useState("");
  const [assignedTo, setAssignedTo] = useState("");



  // --- Dropdowns ---
  const [status, setStatus] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [type, setType] = useState<string | null>(null);
  const [serviceType, setServiceType] = useState<string | null>(null);

  const [statuses, setStatuses] = useState<DropdownOption[]>([]);
  const [priorities, setPriorities] = useState<DropdownOption[]>([]);
  const [types, setTypes] = useState<DropdownOption[]>([]);

  // --- Selected search IDs ---
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  // --- Optional fields ---
  const [estimatedDuration, setEstimatedDuration] = useState<string | null>(null);
  const [supervisor, setSupervisor] = useState<string>(""); // selected supervisor name
  const [supervisorId, setSupervisorId] = useState<string | null>(null); // supervisor ID

  const [supervisorSearchQuery, setSupervisorSearchQuery] = useState("");
  const [supervisorSearchResults, setSupervisorSearchResults] = useState<
    { id: string; name: string }[]
  >([]);
  const [laborHours, setLaborHours] = useState<string | null>(null);

  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerSearchResults, setCustomerSearchResults] = useState<{ id: string; name: string }[]>([]);
  const [assetSearchQuery, setAssetSearchQuery] = useState("");
  const [assetSearchResults, setAssetSearchResults] = useState<{ id: string; name: string }[]>([]);
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [contactSearchResults, setContactSearchResults] = useState<{ id: string; name: string }[]>([]);
  const [assignedToSearchQuery, setAssignedToSearchQuery] = useState("");
  const [assignedToSearchResults, setAssignedToSearchResults] = useState<{ id: string; name: string }[]>([]);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showStartDate, setShowStartDate] = useState(false);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showEndDate, setShowEndDate] = useState(false);
  const [completionDate, setCompletionDate] = useState<Date | null>(null);
  const [showCompletionDate, setShowCompletionDate] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);


  const [requiredTechnicians, setRequiredTechnicians] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState("");
  const [vehicleSearchResults, setVehicleSearchResults] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);




  // --- Auth token ---
  const token = useAuthStore.getState().token;
  console.log("🔑 Token:", token);

  const fetchDropdowns = async () => {
    try {
      const typesRes = await api.get<DropdownOption[]>("/work_order_types");
      setTypes(typesRes || []);  // ✅ removed .data

      const statusesRes = await api.get<DropdownOption[]>("/work_order_statuses");
      setStatuses(statusesRes || []);

      const prioritiesRes = await api.get<DropdownOption[]>("/work_order_priorities");
      setPriorities(prioritiesRes || []);
    } catch (err) {
      console.error("Failed to fetch dropdowns:", err);
    }
  };

  const fetchVehicles = async () => {
    try {
      // api.get<T> returns T (res.data) according to your wrapper
      const list = await api.get<Vehicle[]>("/vehicles/dropdown");
      setVehicles(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setVehicles([]);
    }
  };


  useEffect(() => {
    if (vehicleSearchQuery.trim().length < 2) {
      setVehicleSearchResults([]);
      return;
    }

    const q = vehicleSearchQuery.toLowerCase();
    const results = vehicles.filter(v => (v.name ?? "").toLowerCase().includes(q));
    setVehicleSearchResults(results);
  }, [vehicleSearchQuery, vehicles]);


  useEffect(() => {
    fetchDropdowns();
    fetchVehicles();
  }, []);


  // --- Handle submit ---
  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Title is required");
      return;
    }

    try {
      const payload = {
        title,
        description,
        long_description: notes,
        status_id: status || null,
        priority_id: priority || null,
        type_id: type || null,
        service_type: serviceType || null,
        customer_id: selectedCustomerId || null,
        asset_id: selectedAssetId || null,
        customer_contact_id: selectedContactId || null,
        estimated_duration: estimatedDuration || null,
        actual_start_date: startDate ? startDate.toISOString() : null,
        required_technicians: requiredTechnicians ? Number(requiredTechnicians) : null,
        vehicle_requirements: selectedVehicleId || null,
        completion_date: endDate ? endDate.toISOString() : null,
        assigned_to: assignedTo || null,
        supervisor_id: supervisor || null,
        labor_hours: laborHours || null,
        notes,
        attachments: null,
        scheduled_at: schedule || null

      };

      console.log("📦 Submitting payload:", payload);
      await api.post("/work_order", payload);
      navigation.goBack();
    } catch (error: any) {
      console.error("❌ Error creating work order:", error);
      Alert.alert("Error", error.response?.data?.error || "Failed to save work order");
    }
  };


  // Assigned To search
  useEffect(() => {
    const fetchAssignedUsers = async () => {
      if (assignedToSearchQuery.trim().length < 2) {
        setAssignedToSearchResults([]);
        return;
      }
      const results = await searchUsers(assignedToSearchQuery);
      setAssignedToSearchResults(results);
    };
    const debounce = setTimeout(fetchAssignedUsers, 300);
    return () => clearTimeout(debounce);
  }, [assignedToSearchQuery]);

  // Customer search
  useEffect(() => {
    const fetchCustomers = async () => {
      if (customerSearchQuery.trim().length < 2) {
        setCustomerSearchResults([]);
        return;
      }
      const results = await searchCustomers(customerSearchQuery);
      setCustomerSearchResults(results);
    };
    const debounce = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(debounce);
  }, [customerSearchQuery]);

  // Asset search
  useEffect(() => {
    const fetchAssets = async () => {
      if (assetSearchQuery.trim().length < 2) {
        setAssetSearchResults([]);
        return;
      }
      const results = await searchAssets(assetSearchQuery);
      setAssetSearchResults(results);
    };
    const debounce = setTimeout(fetchAssets, 300);
    return () => clearTimeout(debounce);
  }, [assetSearchQuery]);



  useEffect(() => {
    if (workorder && mode !== "create") {

      // --- Basic fields ---
      setTitle(workorder.title || "");
      setDescription(workorder.description || "");
      setNotes(workorder.long_description || "");

      // --- Dropdown fields ---
      setStatus(workorder.status_id || "");
      setPriority(workorder.priority_id || "");
      console.log(" type:", workorder.type_id);
      setType(workorder.type_id || "");
      console.log("Workorder service type:", workorder.service_type);
      setServiceType(workorder.service_type || "");

      // --- Linked Search IDs ---
      setSelectedCustomerId(workorder.customer_id || "");
      setCustomerSearchQuery(workorder.customer_name || "");

      setSelectedAssetId(workorder.asset_id || "");
      setAssetSearchQuery(workorder.asset_name || "");

      setSelectedContactId(workorder.customer_contact_id || "");
      setContactSearchQuery(workorder.contact_name || "");

      // --- Assignments ---
      setAssignedTo(workorder.assigned_to || "");
      setAssignedToSearchQuery(workorder.assigned_to_name || "");

      setSupervisor(workorder.supervisor_id || "");
      setSupervisorSearchQuery(workorder.supervisor_name || "");

      // --- Optional Fields ---
      setEstimatedDuration(workorder.estimated_duration?.toString() || "");
      setLaborHours(workorder.labor_hours?.toString() || "");

      setStartDate(
        workorder.scheduled_at
          ? new Date(workorder.scheduled_at)
          : null
      );

      // 2️⃣ Actual Start Date
      setEndDate(
        workorder.actual_start_date
          ? new Date(workorder.actual_start_date)
          : null
      );

      // 3️⃣ Completion Date
      setCompletionDate(
        workorder.completion_date
          ? new Date(workorder.completion_date)
          : null
      );
      setRequiredTechnicians(workorder.required_technicians?.toString() || "");
      setSelectedVehicleId(workorder.vehicle_requirements || null);
      setVehicleSearchQuery(workorder.vehicle_name || "");

    }
  }, [workorder]);

  const handleDelete = async () => {
    if (!workorder?.id) return;

    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this work order?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await api.delete<{ message: string; deletedWorkOrder: any }>(
                `/work_order/${workorder.id}`
              );

              Alert.alert("Success", response.message);
              navigation.goBack(); // Go back after deletion
            } catch (err: any) {
              console.error("Delete error:", err.response || err.message);
              Alert.alert("Error", "Failed to delete work order");
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",    // Oct
      day: "2-digit",    // 18
      year: "numeric",   // 2025
      hour: "2-digit",
      minute: "2-digit",
      hour12: true       // 12-hour format with AM/PM
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FormHeader
        title={
          isCreateMode
            ? "Create Work Order"
            : isEditMode
              ? "Edit Work Order"
              : "View Work Order"
        }
        subtitle={
          isCreateMode
            ? "Add a new Work Order to your inventory"
            : isEditMode
              ? "Update existing Work Order details"
              : "View Work Order information"
        }
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.container}>
        {/* Section Header */}
        <View style={styles.headerRow}>
          <Text style={styles.subHeader}>ASSET DETAILS</Text>
          {isViewMode && (
            <TouchableOpacity
              style={styles.editSmallButton}
              onPress={() =>
                navigation.navigate("CreateWorkorder", {
                  mode: "edit",
                  workorder,
                })
              }
            >
              <Ionicons name="create-outline" size={16} color="#fff" />
              <Text style={styles.editSmallButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Work Order Info */}
        <View style={styles.section}>
          {/* Row 1 */}
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Title *</Text>
              {isViewMode ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{title || "-"}</Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="Enter work order number"
                  value={title}
                  onChangeText={setTitle}
                  editable={!isViewMode}
                />
              )}
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>Service Type</Text>
              {isViewMode ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{serviceType || "-"}</Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="Enter service type"
                  value={serviceType || ""}
                  onChangeText={setServiceType}
                  editable={!isViewMode}
                />
              )}
            </View>

          </View>

          {/* Row 2 */}
          <View style={styles.row}>

            {/* STATUS FIELD */}
            <View style={styles.column}>
              <Text style={styles.label}>Status</Text>

              {isViewMode ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>
                    {statuses.find((s) => s.id === status)?.name || "-"}
                  </Text>
                </View>
              ) : (
                <View style={styles.dropdownContainer}>
                  <Picker
                    selectedValue={status}
                    enabled={!isViewMode}
                    onValueChange={(itemValue) => setStatus(itemValue)}
                  >
                    <Picker.Item label="Select status" value="" />
                    {statuses.map((s) => (
                      <Picker.Item key={s.id} label={s.name} value={s.id} />
                    ))}
                  </Picker>
                </View>
              )}
            </View>

            {/* PRIORITY FIELD */}
            <View style={styles.column}>
              <Text style={styles.label}>Priority</Text>

              {isViewMode ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>
                    {priorities.find((p) => p.id === priority)?.name || "-"}
                  </Text>
                </View>
              ) : (
                <View style={styles.dropdownContainer}>
                  <Picker
                    selectedValue={priority}
                    enabled={!isViewMode}
                    onValueChange={(itemValue) => setPriority(itemValue)}
                  >
                    <Picker.Item label="Select priority" value="" />
                    {priorities.map((p) => (
                      <Picker.Item key={p.id} label={p.name} value={p.id} />
                    ))}
                  </Picker>
                </View>
              )}
            </View>

          </View>


          <View style={styles.row}>

            <View style={styles.column}>
              <Text style={styles.label}>Type</Text>

              {isViewMode ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>
                    {types.find((t) => t.id === type)?.name || "-"}
                  </Text>
                </View>
              ) : (
                <View style={styles.dropdownContainer}>
                  <Picker
                    selectedValue={type}
                    enabled={!isViewMode}
                    onValueChange={(itemValue) => setType(itemValue)}
                  >
                    <Picker.Item label="Select type" value="" />
                    {types.map((t) => (
                      <Picker.Item key={t.id} label={t.name} value={t.id} />
                    ))}
                  </Picker>
                </View>
              )}
            </View>


          </View>

          <Text style={styles.label}>Short Description</Text>
          {isViewMode ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>{description || "-"}</Text>
            </View>
          ) : (
            <TextInput
              style={styles.input}
              placeholder="Enter short description"
              value={description}
              onChangeText={setDescription}
              editable={!isViewMode}
            />
          )}

          <Text style={styles.label}>Long Description</Text>
          {isViewMode ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>{notes || "-"}</Text>
            </View>
          ) : (
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter detailed description"
              value={notes}
              onChangeText={setNotes}
              editable={!isViewMode}
              multiline
            />
          )}
        </View>

        {/* CUSTOMER & ASSET */}
        <Text style={styles.subHeader}>CUSTOMER & ASSET</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            {/* 🔍 Customer Search */}
            <View style={styles.column}>
              <Text style={styles.label}>Customer</Text>
              {isViewMode ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{customerSearchQuery || "-"}</Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="Search customer"
                  value={customerSearchQuery}
                  onChangeText={setCustomerSearchQuery}
                  editable={!isViewMode}
                />
              )}
              {customerSearchResults.length > 0 && !isViewMode && (
                <ScrollView style={styles.dropdown}>
                  {customerSearchResults.map((cust) => (
                    <TouchableOpacity
                      key={cust.id}
                      onPress={() => {
                        setSelectedCustomerId(cust.id);
                        setCustomerSearchQuery(cust.name);
                        setCustomerSearchResults([]);
                      }}
                      style={styles.dropdownItem}
                    >
                      <Text>{cust.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* 🔍 Asset Search */}
            <View style={styles.column}>
              <Text style={styles.label}>Asset</Text>
              {isViewMode ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{assetSearchQuery || "-"}</Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="Search asset"
                  value={assetSearchQuery}
                  onChangeText={setAssetSearchQuery}
                  editable={!isViewMode}
                />
              )}
              {assetSearchResults.length > 0 && !isViewMode && (
                <ScrollView style={styles.dropdown}>
                  {assetSearchResults.map((asset) => (
                    <TouchableOpacity
                      key={asset.id}
                      onPress={() => {
                        setSelectedAssetId(asset.id);
                        setAssetSearchQuery(asset.name);
                        setAssetSearchResults([]);
                      }}
                      style={styles.dropdownItem}
                    >
                      <Text>{asset.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>

          {/* 🔍 Customer Contact Search */}
          <Text style={styles.label}>Customer Contact</Text>
          {isViewMode ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>{contactSearchQuery || "-"}</Text>
            </View>
          ) : (
            <TextInput
              style={styles.input}
              placeholder="Search customer contact"
              value={contactSearchQuery}
              onChangeText={setContactSearchQuery}
              editable={!isViewMode}
            />
          )}
          {contactSearchResults.length > 0 && !isViewMode && (
            <ScrollView style={styles.dropdown}>
              {contactSearchResults.map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  onPress={() => {
                    setSelectedContactId(contact.id);
                    setContactSearchQuery(contact.name);
                    setContactSearchResults([]);
                  }}
                  style={styles.dropdownItem}
                >
                  <Text>{contact.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>


        {/* SCHEDULING & DURATION */}
        <Text style={styles.subHeader}>SCHEDULING & DURATION</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Scheduled Start Date</Text>
              {isViewMode ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{startDate ? startDate.toDateString() : "-"}</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.dateInputContainer}
                  onPress={() => !isViewMode && setShowStartDate(true)}
                >
                  <TextInput
                    value={startDate ? startDate.toDateString() : ""}
                    placeholder="mm/dd/yy"
                    editable={false}
                  />
                  <Ionicons name="calendar-outline" size={20} color="#6234E2" />
                </TouchableOpacity>
              )}
              {showStartDate && (
                <DateTimePicker
                  value={startDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(e, date) => {
                    setShowStartDate(false);
                    if (date) setStartDate(date);
                  }}
                />
              )}
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>Actual Start Date</Text>
              {isViewMode ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{endDate ? endDate.toDateString() : "-"}</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.dateInputContainer}
                  onPress={() => !isViewMode && setShowEndDate(true)}
                >
                  <TextInput
                    value={endDate ? endDate.toDateString() : ""}
                    placeholder="mm/dd/yy"
                    editable={false}
                  />
                  <Ionicons name="calendar-outline" size={20} color="#6234E2" />
                </TouchableOpacity>
              )}
              {showEndDate && (
                <DateTimePicker
                  value={endDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(e, date) => {
                    setShowEndDate(false);
                    if (date) setEndDate(date);
                  }}
                />
              )}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Completion Date</Text>
              {isViewMode ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{completionDate ? completionDate.toDateString() : "-"}</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.dateInputContainer}
                  onPress={() => !isViewMode && setShowCompletionDate(true)}
                >
                  <TextInput
                    value={completionDate ? completionDate.toDateString() : ""}
                    placeholder="Select completion date"
                    editable={false}
                  />
                  <Ionicons name="calendar-outline" size={20} color="#6234E2" />
                </TouchableOpacity>
              )}
              {showCompletionDate && (
                <DateTimePicker
                  value={completionDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowCompletionDate(false);
                    if (date) setCompletionDate(date);
                  }}
                />
              )}
            </View>
          </View>
          <View style={styles.row}>
            {/* 🔍 Customer Search */}
            <View style={styles.column}>
              <Text style={styles.label}>Required Technicians</Text>

              {isViewMode ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>
                    {requiredTechnicians || "-"}
                  </Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="Required Technicians"
                  keyboardType="numeric"
                  value={requiredTechnicians}
                  onChangeText={(text) => {
                    const clean = text.replace(/[^0-9]/g, "");
                    setRequiredTechnicians(clean);
                  }}
                />
              )}
            </View>


            {/* 🔍 Asset Search */}
            <View style={styles.column}>
              <Text style={styles.label}>Vehicle Requirements</Text>

              {isViewMode ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>
                    {vehicles.find(v => v.id === selectedVehicleId)?.name ?? "-"}
                  </Text>
                </View>
              ) : (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Search vehicle by plate number"
                    value={vehicleSearchQuery}
                    onChangeText={setVehicleSearchQuery}
                  />

                  {vehicleSearchResults.length > 0 && (
                    <ScrollView style={styles.dropdown}>
                      {vehicleSearchResults.map((vehicle) => (
                        <TouchableOpacity
                          key={String(vehicle.id)}
                          onPress={() => {
                            setSelectedVehicleId(vehicle.id);
                            setVehicleSearchQuery(vehicle.name);
                            setVehicleSearchResults([]);
                          }}
                          style={styles.dropdownItem}
                        >
                          <Text>{vehicle.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </>
              )}
            </View>


          </View>

          <View style={styles.row}>

            {/* ✅ Estimated Duration */}
            <View style={styles.column}>
              <Text style={styles.label}>Estimated Duration (Hours)</Text>
              {isViewMode ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{estimatedDuration || "-"}   </Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="0.0"
                  value={estimatedDuration || ""}     // <-- ADD THIS
                  onChangeText={setEstimatedDuration} // <-- ADD THIS
                  keyboardType="numeric"
                  editable={!isViewMode}
                />
              )}
            </View>

            {/* ✅ Labor Hours */}
            <View style={styles.column}>
              <Text style={styles.label}>Labor Hours</Text>
              {isViewMode ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{laborHours || "-"}   </Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="0.0"
                  value={laborHours || ""}
                  onChangeText={setLaborHours}
                  keyboardType="numeric"
                  editable={!isViewMode}
                />
              )}
            </View>

          </View>

        </View>

        {/* ASSIGNMENT */}
        <Text style={styles.subHeader}>ASSIGNMENT</Text>
        <View style={styles.section}>
          <Text style={styles.label}>Assigned To</Text>
          {isViewMode ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>{assignedToSearchQuery || "-"}   </Text>
            </View>
          ) : (

            <TextInput
              style={styles.input}
              placeholder="Search assigned user"
              value={assignedToSearchQuery}
              onChangeText={setAssignedToSearchQuery}
              editable={!isViewMode}
            />
          )}
          {/* 🔽 Dropdown suggestion list */}
          {assignedToSearchResults.length > 0 && !isViewMode && (
            <ScrollView style={styles.dropdown}>
              {assignedToSearchResults.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  onPress={() => {
                    setAssignedTo(user.id);
                    setAssignedTo(user.name);
                    setAssignedToSearchQuery(user.name);
                    setAssignedToSearchResults([]); // hide dropdown after selection
                  }}
                  style={styles.dropdownItem}
                >
                  <Text>{user.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Supervisor</Text>
          {isViewMode ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>{supervisorSearchQuery || "-"}   </Text>
            </View>
          ) : (

            <TextInput
              style={styles.input}
              placeholder="Search supervisor"
              value={supervisorSearchQuery}
              onChangeText={setSupervisorSearchQuery}
              editable={!isViewMode}
            />
          )}
          {/* Dropdown suggestion list */}
          {supervisorSearchResults.length > 0 && !isViewMode && (
            <ScrollView style={styles.dropdown}>
              {supervisorSearchResults.map((sup) => (
                <TouchableOpacity
                  key={sup.id}
                  onPress={() => {
                    setSupervisorId(sup.id);       // store ID for API
                    setSupervisor(sup.name);       // store Name for UI
                    setSupervisorSearchQuery(sup.name);
                    setSupervisorSearchResults([]); // close dropdown
                  }}
                  style={styles.dropdownItem}
                >
                  <Text>{sup.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ADDITIONAL INFORMATION */}
        <Text style={styles.subHeader}>ADDITIONAL INFORMATION</Text>
        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          {isViewMode ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>{notes || "-"}   </Text>
            </View>
          ) : (
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter notes"
              value={notes}
              onChangeText={setNotes}
              editable={!isViewMode}
              multiline
            />
          )}
          <View style={styles.section}>
            <Text style={styles.label}>Attachments [Json]</Text>
            {isViewMode ? (
              <View style={styles.readOnlyView}>
                <Text style={styles.readOnlyText}>{JSON.stringify(attachments, null, 2) || "-"}   </Text>
              </View>
            ) : (
              <TextInput
                style={styles.input}
                placeholder="No attachments"
                value={JSON.stringify(attachments, null, 2)} // show JSON
                editable={false} // or true if you want to allow manual edit
                multiline
              />
            )}
          </View>
        </View>

        <Text style={styles.subHeader}>System Information</Text>
        {isViewMode && workorder && (
          <View style={styles.systemInfo}>

            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Created by:</Text>
                <Text style={styles.infoValue}>{workorder.created_by_name || "-"}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Updated by:</Text>
                <Text style={styles.infoValue}>{workorder.updated_by_name || "-"}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Created at:</Text>
                <Text style={styles.infoValue}>
                  {workorder.created_at ? formatDate(workorder.created_at) : "-"}
                </Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Updated at:</Text>
                <Text style={styles.infoValue}>
                  {workorder.updated_at ? formatDate(workorder.updated_at) : "-"}
                </Text>
              </View>
            </View>

          </View>
        )}


        <View style={styles.buttonContainer}>
          {(isCreateMode || isEditMode) && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>{isCreateMode ? 'Save Asset' : 'Update Asset'}</Text>
            </TouchableOpacity>
          )}

          {isViewMode && (
            <TouchableOpacity style={styles.cancelButton} onPress={handleDelete}>
              <Text style={styles.cancelText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
  dropdownContainer: {
    backgroundColor: "#E5E5E5",
    borderColor: "#535351B2",
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    height: 44,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  editSmallButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6234E2",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  editSmallButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginTop: 20,
    marginBottom: 8,
  },
  section: { marginTop: 10 },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E5E5E5",
    borderColor: "#535351B2",
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 10,
  },
  dropdown: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginTop: 4,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  column: { flex: 1 },
  label: { fontSize: 14, color: "#6234E2", marginBottom: 6 },
  input: {
    backgroundColor: "#E5E5E5",
    borderColor: "#535351B2",
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  textArea: { height: 80 },
  buttonContainer: { marginTop: 30, marginBottom: 50 },
  createButton: {
    backgroundColor: "#6234E2",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  saveButton: {
    marginTop: 10,
    backgroundColor: "#02923E",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: "#535351",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  cancelText: { color: "#fff", fontWeight: "600" },
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
});
