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

import { Picker } from '@react-native-picker/picker';

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAuthStore } from "../../../store/useAuthStore";

import { Ionicons } from "@expo/vector-icons";
import { searchAssets, searchCustomers, searchUsers } from "@/src/api/workorder";
import { api } from "@/src/api/cilent";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";

type WorkOrder = {
  id: string;
  title?: string;
  type?: string;
  service_type?: string;
  status?: string;
  priority?: string;
  schedule?: string;
  description?: string;
  long_description?: string;
  assigned_to?: string;
  supervisor_id?: string;
  customer_id?: string;
  asset_id?: string;
  customer_contact_id?: string;
  estimated_duration?: string;
  actual_start_date?: string;
  completion_date?: string;
  labor_hours?: string;
  notes?: string;
  attachments?: string;
  scheduled_at?: string;
  organization_id?: string;
  work_order_number?: string;

  status_id?: string;
  priority_id?: string;
  type_id?: string;

  status_name?: string;
  priority_name?: string;
  type_name?: string;
  supervisor_name?: string;
  assigned_to_name?: string;
  customer_name?: string;
  asset_name?: string;
  customer_contact_name?: string;
  contact_name?: string;
};




interface DropdownOption {
  id: string;   // UUID from backend
  name: string; // display name
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
  

  useEffect(() => {
    fetchDropdowns();
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
              <TextInput
                style={styles.input}
                placeholder="Enter work order number"
                value={title}
                onChangeText={setTitle}
                editable={!isViewMode}
              />
            </View>

            <View style={styles.column}>
  <Text style={styles.label}>Service Type</Text>
    <TextInput
    style={styles.input}
    placeholder="Enter service type"
    value={serviceType || ""}
    onChangeText={setServiceType}
    editable={!isViewMode}
  />
</View>

          </View>

          {/* Row 2 */}
        <View style={styles.row}>
  <View style={styles.column}>
    <Text style={styles.label}>Status</Text>
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
  </View>

             <View style={styles.column}>
    <Text style={styles.label}>Priority</Text>
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
  </View>
</View>
        
       <View style={styles.row}>
  <View style={styles.column}>
    <Text style={styles.label}> Type</Text>
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
  </View>
</View>

          <Text style={styles.label}>Short Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter short description"
            value={description}
            onChangeText={setDescription}
            editable={!isViewMode}
          />

          <Text style={styles.label}>Long Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter detailed description"
            value={notes}
            onChangeText={setNotes}
            editable={!isViewMode}
            multiline
          />
        </View>

        {/* CUSTOMER & ASSET */}
     <Text style={styles.subHeader}>CUSTOMER & ASSET</Text>
<View style={styles.section}>
  <View style={styles.row}>
    {/* 🔍 Customer Search */}
    <View style={styles.column}>
      <Text style={styles.label}>Customer</Text>
      <TextInput
        style={styles.input}
        placeholder="Search customer"
        value={customerSearchQuery}
        onChangeText={setCustomerSearchQuery}
        editable={!isViewMode}
      />

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
      <TextInput
        style={styles.input}
        placeholder="Search asset"
        value={assetSearchQuery}
        onChangeText={setAssetSearchQuery}
        editable={!isViewMode}
      />

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
  <TextInput
    style={styles.input}
    placeholder="Search customer contact"
    value={contactSearchQuery}
    onChangeText={setContactSearchQuery}
    editable={!isViewMode}
  />

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

  {/* ✅ Estimated Duration */}
  <View style={styles.column}>
    <Text style={styles.label}>Estimated Duration (Hours)</Text>
    <TextInput
      style={styles.input}
      placeholder="0.0"
      value={estimatedDuration || ""}     // <-- ADD THIS
      onChangeText={setEstimatedDuration} // <-- ADD THIS
      keyboardType="numeric"
      editable={!isViewMode}
    />
  </View>

  {/* ✅ Labor Hours */}
  <View style={styles.column}>
    <Text style={styles.label}>Labor Hours</Text>
    <TextInput
      style={styles.input}
      placeholder="0.0"
      value={laborHours || ""}
      onChangeText={setLaborHours}
      keyboardType="numeric"
      editable={!isViewMode}
    />
  </View>

</View>

        </View>

        {/* ASSIGNMENT */}
       <Text style={styles.subHeader}>ASSIGNMENT</Text>
<View style={styles.section}>
  <Text style={styles.label}>Assigned To</Text>

  {/* 🔍 Search input */}
  <TextInput
    style={styles.input}
    placeholder="Search assigned user"
    value={assignedToSearchQuery}
    onChangeText={setAssignedToSearchQuery}
    editable={!isViewMode}
  />

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

  {/* Search input */}
  <TextInput
    style={styles.input}
    placeholder="Search supervisor"
    value={supervisorSearchQuery}
    onChangeText={setSupervisorSearchQuery}
    editable={!isViewMode}
  />

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
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter notes"
            value={notes}
            onChangeText={setNotes}
            editable={!isViewMode}
            multiline
          />

         <View style={styles.section}>
  <Text style={styles.label}>Attachments [Json]</Text>
  <TextInput
    style={styles.input}
    placeholder="No attachments"
    value={JSON.stringify(attachments, null, 2)} // show JSON
    editable={false} // or true if you want to allow manual edit
    multiline
  />
</View>
        </View>

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
});
