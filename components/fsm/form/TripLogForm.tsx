import DateTimePicker from "@react-native-community/datetimepicker";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
// import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

import SearchDropdown from "@/components/common/searchDropdown";
import { createTripLog, updateTripLog } from "@/src/api/auth";
import { api } from "@/src/api/cilent";
import { Ionicons } from "@expo/vector-icons";
import FormHeader from "../../common/FormHeader";


type Mode = "create" | "view" | "edit";

type TripLog = {
  id?: string;
  trip_id?: string;
  timestamp?: string;
  latitude?: string;
  longitude?: string;
  note?: string;
  photo?: string;

  // Linking info
  work_order_number?: string;
  job_assignment_id?: string;
  technician_name?: string;
  vehicle_id?: string;

  // Location & travel
  site_name?: string;
  site_address?: string;
  gps_coordinates?: string;
  start_odometer?: string;
  end_odometer?: string;
  total_duration?: string;
  total_mileage?: string; // optional
  travel_time?: string;

  // Work performed
  work_description?: string;
  equipment_condition_id?: string;
  parts_used?: string;
  time_on_site?: string;

  // Issues / observations
  root_cause?: string;
  resolution?: string;
  technician_notes?: string;
  job_status_id?: string;

  // Media
  photos?: { alt: string; path: string; originalName: string }[];
  attachments?: { path: string; originalName: string }[];

  trip_date?: string;
  start_time?: string;
  end_time?: string;
};



type RouteParams = {
  mode: Mode;
  data?: TripLog;
};

type TripItem = { id: string; name: string };
type PickerMode = "date" | "start" | "end";

interface DropdownOption {
  id: number;
  name: string;
}

interface AssignmentResponse {
  success: boolean;
  message?: string;       // <-- ADD THIS
  work_order_id?: string;
  job_assignment_id?: string;
  technician_name?: string;
  vehicle_id?: string;
  site_name?: string;
  site_address?: string;
}


interface GPSResponse {
  success: boolean;
  gps_coordinates: string;
}

export interface WorkOrder {
  id: string;
  work_order_number: string;
  title: string;
  description: string;
  long_description: string;
  customer_id: string;
  status_id: string;
  priority_id: string;
}

interface WorkOrderResponse {
  success: boolean;
  work_orders: WorkOrder[];
}

export default function TripLogForm() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();

  const { mode: initialMode, data } =
    (route.params as RouteParams) ?? { mode: "create", data: undefined };

  const [mode, setMode] = useState<Mode>(initialMode);


  const [equipmentConditions, setEquipmentConditions] = useState<DropdownOption[]>([]);
  const [tripStatuses, setTripStatuses] = useState<DropdownOption[]>([]);

  const [selectedEquipmentCondition, setSelectedEquipmentCondition] = useState<string>("");
  const [selectedTripStatus, setSelectedTripStatus] = useState<string>("");

  const [startOdo, setStartOdo] = useState("");
  const [endOdo, setEndOdo] = useState("");


  const [form, setForm] = useState<TripLog>({
    trip_id: "",
    timestamp: "",
    latitude: "",
    longitude: "",
    note: "",
    ...data,
  });

  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<any>(null);
  const [tripResults, setTripResults] = useState<TripItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState("");
  const [showPicker, setShowPicker] = useState({ mode: "", visible: false });
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [workDescription, setWorkDescription] = useState("");
  const [timeOnSite, setTimeOnSite] = useState("");
  const [partsUsed, setPartsUsed] = useState("");
  const [documentFiles, setDocumentFiles] = useState<any[]>([]);

  const [rootCause, setRootCause] = useState("");
  const [resolutionTaken, setResolutionTaken] = useState("");
  const [technicianNotes, setTechnicianNotes] = useState("");

  const [formData, setFormData] = useState({
    work_order_number: "",
    job_assignment_id: "",
    technician_name: "",
    vehicle_id: "",
    site_name: "",
    site_address: "",
    gps_coordinates: "",
  });
  const [isAssignmentLoading, setIsAssignmentLoading] = useState(false);

  const totalMileage =
    startOdo && endOdo ? (Number(endOdo) - Number(startOdo)).toString() : "";

  const openCameraBefore = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow camera access");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setBeforeImage(result.assets[0].uri);
    }
  };

  const openGalleryBefore = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Allow gallery access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setBeforeImage(result.assets[0].uri);
    }
  };

  const openCameraAfter = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow camera access");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setAfterImage(result.assets[0].uri);
    }
  };

  const openGalleryAfter = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Allow gallery access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setAfterImage(result.assets[0].uri);
    }
  };

  const openDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const selectedDocs = result.assets.map(file => ({
        name: file.name,
        uri: file.uri,
        file,
      }));

      setDocumentFiles(prev => [...prev, ...selectedDocs]);
    } catch (error) {
      console.log("DocumentPicker Error:", error);
    }
  };

  // 📌 Document Picker

  const handleOpenPicker = (mode: PickerMode): void => {
    setShowPicker({ mode, visible: true });
  };

  const handleChangetime = (
    event: any,
    selectedDate?: Date | undefined
  ) => {
    setShowPicker({ ...showPicker, visible: false });
    if (!selectedDate) return;

    if (showPicker.mode === "date") {
      setDate(selectedDate); // store Date object
    } else if (showPicker.mode === "start") {
      setStartTime(selectedDate);
      calculateDuration(selectedDate, endTime);
    } else if (showPicker.mode === "end") {
      setEndTime(selectedDate);
      calculateDuration(startTime, selectedDate);
    }
  };

  const calculateDuration = (start?: Date | null, end?: Date | null): void => {
    if (!start || !end) return;

    const diffMinutes = (end.getTime() - start.getTime()) / 1000 / 60;
    const minutes = diffMinutes < 0 ? diffMinutes + 24 * 60 : diffMinutes;

    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    setDuration(`${hrs} Hr ${mins} Min`);
  };

  const handleChange = (key: keyof TripLog, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };


  // Search Trip IDs
  const searchTrips = async (text: string) => {
    if (!text || text.length < 2) {
      setTripResults([]);
      return;
    }

    try {
      const res = await api.get<TripItem[]>(
        `/field_worker_trips?search=${text}`
      );

      const formatted = Array.isArray(res)
        ? res.map((t) => ({ ...t, name: t.id }))
        : [];

      setTripResults(formatted);
    } catch (err) {
      console.log("Trip search error:", err);
      setTripResults([]);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const equipRes = await api.get<DropdownOption[]>("/triplog_equipment_conditions");
      setEquipmentConditions(equipRes || []);

      const statusRes = await api.get<DropdownOption[]>("/triplog_statuses");
      setTripStatuses(statusRes || []);
    } catch (err) {
      console.error("Failed to fetch dropdowns:", err);
    }
  };


  const fetchWorkOrders = async () => {
    try {
      const res = await api.get<WorkOrderResponse>("/work_order");

      if (Array.isArray(res?.work_orders)) {
        setWorkOrders(res.work_orders);
      } else {
        console.warn("Unexpected response format:", res);
        setWorkOrders([]);
      }

    } catch (err) {
      console.error("Work Order fetch error:", err);
      setWorkOrders([]);
    }
  };


  const handleWorkOrderSelect = async (workOrderId: string) => {
    const selected = workOrders.find(w => w.id === workOrderId);
    if (!selected) return;

    // Update basic fields first
    setFormData(prev => ({
      ...prev,
      work_order_number: selected.work_order_number,
      title: selected.title,
      description: selected.description,
      long_description: selected.long_description,
      customer_id: selected.customer_id,
      status_id: selected.status_id,
      priority_id: selected.priority_id,
    }));

    try {
      setIsAssignmentLoading(true);

      // Fetch assignment
      const assignment: AssignmentResponse = await api.get(
        `/triplog_job_assignments/by-work-order/${encodeURIComponent(selected.work_order_number)}`
      );

      // If assignment NOT found
      if (!assignment || !assignment.job_assignment_id) {
        Alert.alert("Info", "Technician not assigned for this Work Order");

        setFormData(prev => ({
          ...prev,
          job_assignment_id: "",
          technician_name: "",
          vehicle_id: "",
          site_name: "",
          site_address: "",
          gps_coordinates: "",
        }));

        return;
      }

      // Assignment found → fetch GPS (silently)
      let gpsCoords = "";
      try {
        const gpsRes: GPSResponse = await api.get(
          `/work_orders_gps/${assignment.work_order_id}/gps`
        );
        if (gpsRes?.success && gpsRes.gps_coordinates) {
          gpsCoords = gpsRes.gps_coordinates;
        }
      } catch {
        // GPS not available → silently ignore, keep gpsCoords = ""
      }

      // Update form with assignment + GPS
      setFormData(prev => ({
        ...prev,
        job_assignment_id: assignment.job_assignment_id || "",
        technician_name: assignment.technician_name || "",
        vehicle_id: assignment.vehicle_id || "",
        site_name: assignment.site_name || "",
        site_address: assignment.site_address || "",
        gps_coordinates: gpsCoords, // empty if not available
      }));

    } catch (err) {
      // Only show alert if assignment fetch fails
      Alert.alert("Info", "Technician not assigned for this Work Order");

      setFormData(prev => ({
        ...prev,
        job_assignment_id: "",
        technician_name: "",
        vehicle_id: "",
        site_name: "",
        site_address: "",
        gps_coordinates: "",
      }));
    } finally {
      setIsAssignmentLoading(false);
    }
  };


  const handleSave = async () => {
    if (!form.trip_id?.trim()) {
      Alert.alert("Validation", "Trip ID is required");
      return;
    }

    setSaving(true);

    // Helper to format time as HH:mm:ss
    const formatTimeForBackend = (date?: Date | null) => {
      if (!date) return "";
      const hrs = date.getHours().toString().padStart(2, "0");
      const mins = date.getMinutes().toString().padStart(2, "0");
      const secs = date.getSeconds().toString().padStart(2, "0");
      return `${hrs}:${mins}:${secs}`;
    };

    try {
      const fd = new FormData();

      // Basic trip fields
      fd.append("trip_id", form.trip_id || "");
      fd.append("trip_date", date ? date.toISOString().split("T")[0] : "");
      fd.append("start_time", formatTimeForBackend(startTime));
      fd.append("end_time", formatTimeForBackend(endTime));
      fd.append("total_duration", duration || "");

      // Linking info
      fd.append("work_order_number", formData.work_order_number || "");
      fd.append("job_assignment_id", formData.job_assignment_id || "");
      fd.append("technician_name", formData.technician_name || "");
      fd.append("vehicle_id", formData.vehicle_id || "");

      // Location & travel
      fd.append("site_name", formData.site_name || "");
      fd.append("site_address", formData.site_address || "");
      fd.append("gps_coordinates", formData.gps_coordinates || "");
      fd.append("start_odometer", String(startOdo || 0));
      fd.append("end_odometer", String(endOdo || 0));
      fd.append("total_mileage", totalMileage || "0");
      fd.append("travel_time", String(timeOnSite || 0));

      // Work performed details
      fd.append("work_description", workDescription || "");
      fd.append("equipment_condition_id", selectedEquipmentCondition || "");
      fd.append("parts_used", partsUsed || "");
      fd.append("time_on_site", String(timeOnSite || 0));

      // Issues & observations
      fd.append("root_cause", rootCause || "");
      fd.append("resolution", resolutionTaken || "");
      fd.append("technician_notes", technicianNotes || "");
      fd.append("job_status_id", selectedTripStatus || "");
      if (beforeImage) fd.append("photos", {
        uri: beforeImage,
        name: `before_${Date.now()}.jpg`,
        type: "image/jpeg"
      } as any);

      if (afterImage) fd.append("photos", {
        uri: afterImage,
        name: `after_${Date.now()}.jpg`,
        type: "image/jpeg"
      } as any);

      // Attachments
      if (documentFile) fd.append("attachments", {
        uri: documentFile.uri,
        name: documentFile.name,
        type: documentFile.mimeType || "application/pdf"
      } as any);

      // GPS
      if (form.latitude) fd.append("latitude", String(form.latitude));
      if (form.longitude) fd.append("longitude", String(form.longitude));

      // Optional note
      if (form.note) fd.append("note", form.note);

      // Send to backend
      let response;
      if (mode === "create") {
        response = await createTripLog(fd);
        Alert.alert("Success", "Trip log created successfully!");
      } else {
        response = await updateTripLog(String(form.id), fd);
        Alert.alert("Success", "Trip log updated successfully!");
      }

      navigation.goBack();
    } catch (err: any) {
      console.error("❌ Error saving trip log:", err?.response?.data || err);
      Alert.alert(
        "Error",
        err?.response?.data?.error || err?.message || "Failed to save trip log"
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    try {
      await api.delete(`/trip_logs/${form.id}`);
      Alert.alert("Deleted", "Trip log deleted");
      navigation.goBack();
    } catch {
      Alert.alert("Delete Failed", "Could not delete trip log");
    }
  };

  useEffect(() => {
    fetchWorkOrders();
    fetchDropdowns();
  }, []);

  useEffect(() => {
    if (!data) return;

    console.log("Prefilling TripLog data:", data);

    // Prefill main form state
    setForm({
      ...data,
      latitude: String(data.latitude ?? ""),
      longitude: String(data.longitude ?? ""),
    });

    // Prefill linking info
    const selectedWorkOrder = workOrders.find(
      (w) => w.work_order_number === data.work_order_number
    );

    setFormData(prev => ({
      ...prev,
      work_order_number: selectedWorkOrder?.work_order_number ?? data.work_order_number ?? "",
      work_order_id: selectedWorkOrder?.id ?? "",
      title: selectedWorkOrder?.title ?? "",
      job_assignment_id: data.job_assignment_id ?? "",
      technician_name: data.technician_name ?? "",
      vehicle_id: data.vehicle_id ?? "",
      site_name: data.site_name ?? "",
      site_address: data.site_address ?? "",
      gps_coordinates: data.gps_coordinates ?? "",
    }));

    // Odometer & times
    setStartOdo(data.start_odometer ?? "");
    setEndOdo(data.end_odometer ?? "");
    setDuration(data.total_duration ?? "");
    setDate(data.trip_date ? new Date(data.trip_date) : null);
    setStartTime(data.start_time ? new Date(`1970-01-01T${data.start_time}`) : null);
    setEndTime(data.end_time ? new Date(`1970-01-01T${data.end_time}`) : null);

    const baseURL = api.getBaseUrl?.() || "";

    // 📸 Photos
    if (Array.isArray(data?.photos) && data.photos.length > 0) {
      setBeforeImage(`${baseURL}${data.photos[0].path}`);
    }

    if (Array.isArray(data?.photos) && data.photos.length > 1) {
      setAfterImage(`${baseURL}${data.photos[1].path}`);
    }

    // 📄 Document Attachment
    if (Array.isArray(data?.attachments) && data.attachments.length > 0) {
      const file = data.attachments[0];
      setDocumentFile({
        name: decodeURIComponent(file.originalName || "Attachment"),
        url: `${baseURL}${file.path}`,
      });
    } else {
      setDocumentFile(null);
    }


    // Document (first attachment)
    // 📄 Multiple Attachments
    if (Array.isArray(data?.attachments) && data.attachments.length > 0) {
      const baseURL = api.getBaseUrl?.() || "";
      const files = data.attachments.map(att => ({
        name: decodeURIComponent(att.originalName || "Attachment"),
        url: `${baseURL}${att.path}`,
      }));
      setDocumentFiles(files);
    } else {
      setDocumentFiles([]);
    }


    // Dropdowns
    setSelectedTripStatus(data.job_status_id ?? "");
    setSelectedEquipmentCondition(data.equipment_condition_id ?? "");

    // Work performed
    setWorkDescription(data.work_description ?? "");
    setPartsUsed(data.parts_used ?? "");
    setTimeOnSite(data.time_on_site ?? "");
    setRootCause(data.root_cause ?? "");
    setResolutionTaken(data.resolution ?? "");
    setTechnicianNotes(data.technician_notes ?? "");

  }, [data, workOrders]);


  const headerTitle =
    mode === "create"
      ? "Create Trip Log"
      : mode === "view"
        ? "View Trip Log"
        : "Edit Trip Log";

  const headerSubtitle =
    mode === "create"
      ? "Add a new trip record"
      : mode === "view"
        ? "View detailed trip information"
        : "Update trip log details";

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FormHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.header}>Trip Log Details</Text>

        {mode === "view" ? (
          <View style={styles.readOnlyView}>
            <Text style={styles.label}>Trip ID</Text>
            <Text style={styles.readOnlyText}>
              {form.trip_id
                ? tripResults.find((t) => t.id === form.trip_id)?.name || form.trip_id
                : "-"}
            </Text>
          </View>
        ) : (
          <SearchDropdown
            label="Trip ID"
            placeholder="Search Trip ID"
            editable={true}
            value={
              tripResults.find((t) => t.id === form.trip_id)?.name ||
              form.trip_id ||
              ""
            }
            data={tripResults.map((t) => t.name)}
            onSearch={searchTrips}
            onSelect={(selectedName) => {
              const selected = tripResults.find((t) => t.name === selectedName);
              if (selected) handleChange("trip_id", selected.id);
            }}
          />
        )}

        {/* Core Trip Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📄 Core Trip Information</Text>

          <View style={styles.row}>
            {/* Date */}
            <View style={styles.col}>
              <Text style={styles.label}>Date *</Text>
              {mode === "view" ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>
                    {date ? date.toLocaleDateString() : "-"}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity onPress={() => handleOpenPicker("date")}>
                  <TextInput
                    style={styles.input}
                    placeholder="dd-mm-yyyy"
                    value={date ? date.toLocaleDateString() : ""}
                    editable={false}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Start Time */}
            <View style={styles.col}>
              <Text style={styles.label}>Start Time *</Text>
              {mode === "view" ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>
                    {startTime
                      ? startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "-"}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity onPress={() => handleOpenPicker("start")}>
                  <TextInput
                    style={styles.input}
                    placeholder="Select Time"
                    value={startTime
                      ? startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : ""}
                    editable={false}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.row}>
            {/* End Time */}
            <View style={styles.col}>
              <Text style={styles.label}>End Time *</Text>
              {mode === "view" ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>
                    {endTime
                      ? endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "-"}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity onPress={() => handleOpenPicker("end")}>
                  <TextInput
                    style={styles.input}
                    placeholder="Select Time"
                    value={endTime
                      ? endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : ""}
                    editable={false}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Total Duration */}
            <View style={styles.col}>
              <Text style={styles.label}>Total Duration</Text>
              {mode === "view" ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>
                    {duration || "-"}
                  </Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="Auto-calculated"
                  value={duration}
                  editable={true}
                />
              )}
            </View>
          </View>

          {/* DateTimePicker */}
          {showPicker.visible && (
            <DateTimePicker
              value={
                showPicker.mode === "date"
                  ? date || new Date()
                  : showPicker.mode === "start"
                    ? startTime || new Date()
                    : endTime || new Date()
              }
              mode={showPicker.mode === "date" ? "date" : "time"}
              is24Hour={true}
              onChange={handleChangetime}
            />
          )}
        </View>


        {/* Linked Assignment */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🔗 Linked Assignment</Text>

          <View style={styles.col}>
            <Text style={styles.label}>Work Order Number *</Text>
            {mode === "view" ? (
              <View style={styles.readOnlyView}>
                <Text style={styles.readOnlyText}>
                  {/* Find the selected work order object based on formData.work_order_number */}
                  {formData.work_order_number
                    ? (() => {
                      const selectedOrder = workOrders.find(
                        (o) => o.work_order_number === formData.work_order_number
                      );
                      return selectedOrder
                        ? `${selectedOrder.work_order_number} - ${selectedOrder.title}`
                        : "-";
                    })()
                    : "-"}
                </Text>
              </View>
            ) : (
              <View style={styles.pickerContainer}>

                <Picker
                  selectedValue={formData.work_order_number}
                  onValueChange={handleWorkOrderSelect}
                  style={styles.pickerStyle}
                  enabled={true}
                >
                  <Picker.Item label="Select Work Order" value="" />
                  {workOrders.map((order) => (
                    <Picker.Item
                      key={order.id}
                      label={`${order.work_order_number} - ${order.title}`}
                      value={order.work_order_number} // must match selectedValue
                    />
                  ))}
                </Picker>

              </View>
            )}
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Job Assignment ID</Text>

            {mode === "view" ? (
              <View style={styles.readOnlyView}>
                <Text style={styles.readOnlyText}>
                  {formData.job_assignment_id || "-"}
                </Text>
              </View>
            ) : (
              <TextInput
                placeholder="Auto-populated from assignment"
                editable={true} // editable in edit/create mode
                value={formData.job_assignment_id}
                style={styles.input}
              />
            )}
          </View>


          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Technician Name</Text>
              {mode === "view" ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>
                    {formData.technician_name || "-"}
                  </Text>
                </View>
              ) : (
                <TextInput placeholder="Auto-populated from assignment" value={formData.technician_name} style={styles.input} editable={true} />
              )}
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Vehicle ID</Text>
              {mode === "view" ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>
                    {formData.vehicle_id || "-"}
                  </Text>
                </View>
              ) : (
                <TextInput placeholder="Auto-populated from assignment" value={formData.vehicle_id} style={styles.input} editable={true} />
              )}
            </View>
          </View>
        </View>

        {/* Location & Travel Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📍 Location & Travel Information</Text>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Site/Location Name</Text>
              {mode === "view" ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>
                    {formData.site_name || "-"}
                  </Text>
                </View>
              ) : (
                <TextInput
                  placeholder="Auto-populated from assignment"
                  value={formData.site_name}
                  style={styles.input}
                  editable={true}
                />
              )}

            </View>
            <View style={styles.col}>
              <Text style={styles.label}>GPS Coordinates</Text>
              {mode === "view" ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>
                    {formData.gps_coordinates || "-"}
                  </Text>
                </View>
              ) : (
                <TextInput placeholder="Auto-captured" value={formData.gps_coordinates} style={styles.input} editable={true} />

              )}   </View>
          </View>

          <Text style={styles.label}>Site Address</Text>
          {mode === "view" ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>
                {formData.site_address || "-"}
              </Text>
            </View>
          ) : (
            <TextInput
              placeholder="Auto-populated from assignment"
              value={formData.site_address}
              style={[styles.input, { height: 70 }]}
              editable={true}
              multiline
            />
          )}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Starting Odometer *</Text>
              {mode === "view" ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>
                    {startOdo || "-"}
                  </Text>
                </View>
              ) : (
                <TextInput
                  placeholder="e.g., 45000"
                  style={styles.input}
                  keyboardType="numeric"
                  value={startOdo}
                  onChangeText={setStartOdo}
                  editable={true}
                />
              )}
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Ending Odometer *</Text>
              {mode === "view" ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>
                    {endOdo || "-"}
                  </Text>
                </View>
              ) : (
                <TextInput
                  placeholder="e.g., 45025"
                  style={styles.input}
                  keyboardType="numeric"
                  value={endOdo}
                  onChangeText={setEndOdo}
                  editable={true}
                />
              )}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Total Mileage</Text>
              {mode === "view" ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>
                    {totalMileage || "-"}
                  </Text>
                </View>
              ) : (
                <TextInput
                  placeholder="Auto-calculated"
                  style={styles.input}
                  value={totalMileage}
                  editable={true}
                />
              )}
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Travel Time</Text>
              {mode === "view" ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>
                    {duration || "-"}
                  </Text>
                </View>
              ) : (
                <TextInput placeholder="Auto-calculated" value={duration} style={styles.input} editable={true} />

              )}   </View>
          </View>
        </View>

        {/* Work Performed Details */}
        <View style={styles.card}>

          <Text style={styles.sectionTitle}>🛠️ Work Performed Details</Text>

          <Text style={styles.label}>Actual Work Description *</Text>
          {mode === "view" ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>
                {workDescription || "-"}
              </Text>
            </View>
          ) : (
            <TextInput
              placeholder="Describe what was actually completed..."
              style={[styles.input, { height: 80 }]}
              multiline
              value={workDescription}
              onChangeText={setWorkDescription}
              editable={true}
            />

          )}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Equipment Condition *</Text>

              {mode === "view" ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>
                    {selectedEquipmentCondition
                      ? equipmentConditions.find(
                        (item) => item.id.toString() === selectedEquipmentCondition
                      )?.name
                      : "-"}
                  </Text>
                </View>
              ) : (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedEquipmentCondition}
                    onValueChange={(value) => setSelectedEquipmentCondition(value)}
                    style={styles.pickerStyle}
                    enabled={true}
                  >
                    <Picker.Item label="Select equipment condition" value="" />
                    {equipmentConditions.map((item) => (
                      <Picker.Item key={item.id} label={item.name} value={item.id} />
                    ))}
                  </Picker>
                </View>
              )}

            </View>


            <View style={styles.col}>
              <Text style={styles.label}>Time on Site</Text>
              {mode === "view" ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>
                    {timeOnSite || "-"}
                  </Text>
                </View>
              ) : (
                <TextInput
                  placeholder="e.g., 2h 30m"
                  style={styles.input}
                  value={timeOnSite}
                  onChangeText={setTimeOnSite}
                  editable={true}
                />
              )}
            </View>
          </View>

          <Text style={styles.label}>Parts/Materials Used</Text>
          {mode === "view" ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>
                {partsUsed || "-"}
              </Text>
            </View>
          ) : (
            <TextInput
              placeholder="List all parts and materials..."
              style={[styles.input, { height: 80 }]}
              multiline
              value={partsUsed}
              onChangeText={setPartsUsed}
              editable={true}
            />
          )}
        </View>

        {/* Issues & Observations */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>⚠ Issues & Observations</Text>

          <Text style={styles.label}>Root Cause Identified *</Text>
          {mode === "view" ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>
                {rootCause || "-"}
              </Text>
            </View>
          ) : (
            <TextInput
              style={styles.textarea}
              placeholder="What caused the problem..."
              multiline
              value={rootCause}
              onChangeText={setRootCause}
              editable={true}
            />
          )}

          <Text style={styles.label}>Resolution / Action Taken *</Text>
          {mode === "view" ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>
                {resolutionTaken || "-"}
              </Text>
            </View>
          ) : (
            <TextInput
              style={styles.textarea}
              placeholder="How the issue was resolved..."
              multiline
              value={resolutionTaken}
              onChangeText={setResolutionTaken}
              editable={true}
            />
          )}

          <Text style={styles.label}>Technician Notes / Comments</Text>
          {mode === "view" ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>
                {technicianNotes || "-"}
              </Text>
            </View>
          ) : (
            <TextInput
              style={styles.textarea}
              placeholder="Additional observations..."
              multiline
              value={technicianNotes}
              onChangeText={setTechnicianNotes}
              editable={true}
            />
          )}




          <Text style={styles.label}>Trip Status *</Text>

          {mode === "view" ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>
                {selectedTripStatus
                  ? tripStatuses.find((item) => item.id.toString() === selectedTripStatus)?.name
                  : "-"}

              </Text>
            </View>
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedTripStatus}
                onValueChange={(value) => setSelectedTripStatus(value)}
                style={styles.pickerStyle}
                enabled={true}
              >
                <Picker.Item label="Select job status" value="" />
                {tripStatuses.map((item) => (
                  <Picker.Item key={item.id} label={item.name} value={item.id} />
                ))}
              </Picker>
            </View>
          )}

        </View>

        {/* Documentation */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📸  Documentation</Text>

          {/* BEFORE PHOTO */}
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Before Photo</Text>
            {mode !== "view" && (
              <View style={styles.row}>
                <TouchableOpacity style={styles.smallBtn} onPress={openCameraBefore}>
                  <Text style={styles.smallBtnText}>📷 Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.smallBtn} onPress={openGalleryBefore}>
                  <Text style={styles.smallBtnText}>🖼 Gallery</Text>
                </TouchableOpacity>
              </View>
            )}
            {beforeImage && (
              <Image
                source={{ uri: beforeImage }}
                style={styles.previewImage}
              />
            )}
          </View>

          {/* AFTER PHOTO */}
          <View style={styles.block}>
            <Text style={styles.blockTitle}>After Photo</Text>
            {mode !== "view" && (
              <View style={styles.row}>
                <TouchableOpacity style={styles.smallBtn} onPress={openCameraAfter}>
                  <Text style={styles.smallBtnText}>📷 Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.smallBtn} onPress={openGalleryAfter}>
                  <Text style={styles.smallBtnText}>🖼 Gallery</Text>
                </TouchableOpacity>
              </View>
            )}
            {afterImage && (
              <Image
                source={{ uri: afterImage }}
                style={styles.previewImage}
              />
            )}
          </View>



          {/* DOCUMENTATION */}
          <View style={styles.block}>
            <Text style={styles.blockTitle}>📄 Additional Attachments</Text>

            {/* Upload button only in edit/create mode */}
            {mode !== "view" && (
              <TouchableOpacity style={styles.docBtn} onPress={openDocument}>
                <Text style={styles.docBtnText}>📄 Upload Document</Text>
              </TouchableOpacity>
            )}

            {/* Show file name and download button */}
            {documentFile && (
              <View style={{ marginTop: 6, flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{ color: "green", fontWeight: "600", flex: 1 }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Selected: {documentFile.name || documentFile.fileName || "Attachment"}
                </Text>



              </View>
            )}
          </View>

        </View>


        {/* BUTTONS */}
        {mode === "create" && (
          <View style={{ marginTop: 40 }}>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveText}>
                {saving ? "Saving..." : "Save Logs"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === "view" && (
          <View style={{ marginTop: 40 }}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setMode("edit")}
            >
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === "edit" && (
          <View style={{ marginTop: 40 }}>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveText}>
                {saving ? "Updating..." : "Update Logs"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setMode("view")}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1 },
  header: { fontSize: 15, fontWeight: "700", marginBottom: 10, color: "#111" },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#5A31F4",
    marginBottom: 10,
    marginTop: 15,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    fontSize: 16,
  },
  btn: {
    backgroundColor: "#008DFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 12,
    backgroundColor: "#f8f8f8",
    color: "#333",
  },

  disabled: { backgroundColor: "#e9e9e9", color: "#666" },

  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: "center",
    marginBottom: 10,
  },

  noImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#f0f0f0",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  row: { flexDirection: "row", gap: 10, marginBottom: 20 },

  col: {
    flex: 1,
    marginRight: 10,
  },
  block: {
    marginBottom: 20,
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  smallBtn: {
    backgroundColor: "#008DFF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  smallBtnText: {
    color: "white",
    fontWeight: "600",
  },

  docBtn: {
    backgroundColor: "#4B5563",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  docBtnText: {
    color: "#fff",
    fontWeight: "600",
  },

  previewImage: {
    width: 130,
    height: 130,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 6,
    marginBottom: 20,
    elevation: 2,
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    minHeight: 80,
    backgroundColor: "#f8f8f8",
    marginBottom: 15,
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
  subSection: {
    marginTop: 15,
    marginBottom: 5,
    fontWeight: "600",
    fontSize: 14,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 5,
    backgroundColor: "#fff",
    justifyContent: "center",
    height: 50,
    paddingHorizontal: 8,
  },
  pickerStyle: {
    fontSize: 12,
    color: "#101318CC",
    width: "100%",
    height: 50,
  },
  picker: {
    backgroundColor: "#e8eef7",
    borderRadius: 10,

  },
  saveBtn: {
    backgroundColor: "#6B4EFF",
    padding: 13,
    borderRadius: 6,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "700" },

  cancelBtn: {
    backgroundColor: "#3C3C3C",
    padding: 13,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 20,
  },
  cancelText: { color: "#fff", fontWeight: "700" },

  editBtn: {
    backgroundColor: "#1C95F9",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 6,
    justifyContent: "center",
  },
  editBtnText: { color: "#fff", fontWeight: "700", marginLeft: 8 },

  deleteBtn: {
    padding: 13,
    alignItems: "center",
    marginTop: 10,
  },
  deleteText: { color: "#FF4D4D", fontWeight: "700" },
});
