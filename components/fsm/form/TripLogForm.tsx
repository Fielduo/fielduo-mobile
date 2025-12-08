import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
  Alert,
  PermissionsAndroid,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
// import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

import FormHeader from "../../common/FormHeader";
import { api } from "@/src/api/cilent";
import { Ionicons } from "@expo/vector-icons";
import SearchDropdown from "@/components/common/searchDropdown";
import { createTripLog, updateTripLog } from "@/src/api/auth";


type Mode = "create" | "view" | "edit";

type TripLog = {
  id?: string;
  trip_id?: string;
  timestamp: string;
  latitude: string;
  longitude: string;
  note: string;
  photo?: string;
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
    route.params ?? { mode: "create", data: undefined };

  const [equipmentConditions, setEquipmentConditions] = useState<DropdownOption[]>([]);
  const [tripStatuses, setTripStatuses] = useState<DropdownOption[]>([]);

  const [selectedEquipmentCondition, setSelectedEquipmentCondition] = useState<string>("");
  const [selectedTripStatus, setSelectedTripStatus] = useState<string>("");

  const [startOdo, setStartOdo] = useState("");
  const [endOdo, setEndOdo] = useState("");

  const [mode, setMode] = useState<Mode>(initialMode);
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

  // 📌 Document Picker
  const openDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
    });

    if (!result.canceled) {
      setDocumentFile(result.assets[0]);
    }
  };

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




  // Prefill values
  useEffect(() => {
    if (data) {
      setForm({
        id: data.id,
        trip_id: data.trip_id ?? "",
        timestamp: data.timestamp ?? "",
        latitude: String(data.latitude ?? ""),
        longitude: String(data.longitude ?? ""),
        note: data.note ?? "",
        photo: data.photo,
      });
      setImage(data.photo ?? null);
    }
  }, [data]);

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

  useEffect(() => {
    fetchDropdowns();
  }, []);

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


  useEffect(() => {
    fetchWorkOrders();
  }, []);


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


  useEffect(() => {
    fetchDropdowns();

  }, []);



const buildFormData = () => {
  const fd = new FormData();

  // Basic fields
  fd.append("trip_id", form.trip_id || "");
  fd.append("trip_date", date ? date.toISOString().split("T")[0] : "");
  fd.append("start_time", startTime ? startTime.toISOString() : "");
  fd.append("end_time", endTime ? endTime.toISOString() : "");
  fd.append("total_duration", duration || "");

  fd.append("work_order_number", formData.work_order_number || "");
  fd.append("job_assignment_id", formData.job_assignment_id || "");
  fd.append("technician_name", formData.technician_name || "");
  fd.append("vehicle_id", formData.vehicle_id || "");
  fd.append("site_name", formData.site_name || "");
  fd.append("site_address", formData.site_address || "");
  fd.append("gps_coordinates", formData.gps_coordinates || "");

  fd.append("start_odometer", String(startOdo || 0));
  fd.append("end_odometer", String(endOdo || 0));
  fd.append("total_mileage", String(totalMileage || 0));
  fd.append("time_on_site", String(timeOnSite || 0));

  fd.append("work_description", workDescription || "");
  fd.append("equipment_condition_id", selectedEquipmentCondition || "");
  fd.append("parts_used", partsUsed || "");
  fd.append("root_cause", rootCause || "");
  fd.append("resolution", resolutionTaken || "");
  fd.append("technician_notes", technicianNotes || "");
  fd.append("job_status_id", selectedTripStatus || "");

  // 🔥 PHOTOS JSON
  const photosArr: any[] = [];
  if (beforeImage) {
    photosArr.push({
      uri: beforeImage,
      name: "before.jpg",
      type: "image/jpeg",
    });
  }
  if (afterImage) {
    photosArr.push({
      uri: afterImage,
      name: "after.jpg",
      type: "image/jpeg",
    });
  }
  fd.append("photos", JSON.stringify(photosArr));

  // 🔥 ATTACHMENTS JSON
  const attachArr: any[] = [];
  if (documentFile) {
    attachArr.push({
      uri: documentFile.uri,
      name: documentFile.name,
      type: documentFile.mimeType || "application/pdf",
    });
  }
  fd.append("attachments", JSON.stringify(attachArr));

  // Latitude/Longitude
  if (form.latitude && form.longitude) {
    fd.append("latitude", String(form.latitude));
    fd.append("longitude", String(form.longitude));
  }

  return fd;
};



  // Save (create/update)
  const handleSave = async () => {
    setSaving(true);

    try {
      const fd = buildFormData();

      console.log("🚀 FORM DATA PAYLOAD START --------------");

      const debugFd: any = fd;
      debugFd._parts?.forEach((p: any) => {
        console.log("KEY:", p[0]);
        console.log("VALUE:", p[1]);
      });

      console.log("🚀 FORM DATA PAYLOAD END ----------------");

      let response: any;

      if (mode === "create") {
        response = await createTripLog(fd);
        console.log("🌟 CREATE RESPONSE:", response.data);
        Alert.alert("Success", "Trip log created");
      } else {
        response = await updateTripLog(String(form.id), fd);
        console.log("🌟 UPDATE RESPONSE:", response.data);
        Alert.alert("Success", "Trip log updated");
      }

      navigation.goBack();
    } catch (err: any) {
      console.log("❌ API Error:", err?.response?.data || err);
      Alert.alert("Error", err?.response?.data?.error || "Save failed");
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



        {/* TRIP SEARCH ID */}
        <SearchDropdown
          label="Trip ID"
          placeholder="Search Trip ID"
          editable={mode !== "view"}
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

        {/* Core Trip Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📄 Core Trip Information</Text>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Date *</Text>
              <TouchableOpacity onPress={() => handleOpenPicker("date")}>
                <TextInput style={styles.input} placeholder="dd-mm-yyyy" value={date ? date.toLocaleDateString() : ""}
                  editable={false} />
              </TouchableOpacity>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Start Time *</Text>
              <TouchableOpacity onPress={() => handleOpenPicker("start")}>
                <TextInput style={styles.input} placeholder="Select Time" value={startTime ? startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  editable={false} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>End Time *</Text>
              <TouchableOpacity onPress={() => handleOpenPicker("end")}>
                <TextInput style={styles.input} placeholder="Select Time" value={endTime ? endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  editable={false} />
              </TouchableOpacity>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Total Duration</Text>
              <TextInput style={styles.input} placeholder="Auto-calculated" value={duration} editable={false} />
            </View>
          </View>

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
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.work_order_number}
                onValueChange={handleWorkOrderSelect}
                style={styles.pickerStyle}
              >
                <Picker.Item label="Select Work Order" value="" />

                {workOrders.map(order => (
                  <Picker.Item
                    key={order.id}
                    label={`${order.work_order_number} - ${order.title}`}
                    value={order.id}   // or order.work_order_number — depends on your need
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Job Assignment ID</Text>
            <TextInput placeholder="Auto-populated from assignment" value={formData.job_assignment_id} style={styles.input} editable={false} />
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Technician Name</Text>
              <TextInput placeholder="Auto-populated from assignment" value={formData.technician_name} style={styles.input} editable={false} />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Vehicle ID</Text>
              <TextInput placeholder="Auto-populated from assignment" value={formData.vehicle_id} style={styles.input} editable={false} />
            </View>
          </View>
        </View>

        {/* Location & Travel Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📍 Location & Travel Information</Text>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Site/Location Name</Text>
              <TextInput placeholder="Auto-populated from assignment" value={formData.site_name} style={styles.input} editable={false} />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>GPS Coordinates</Text>
              <TextInput placeholder="Auto-captured" value={formData.gps_coordinates} style={styles.input} editable={false} />
            </View>
          </View>

          <Text style={styles.label}>Site Address</Text>
          <TextInput
            placeholder="Auto-populated from assignment"
            value={formData.site_address}
            style={[styles.input, { height: 70 }]}
            editable={false}
            multiline
          />

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Starting Odometer *</Text>
              <TextInput
                placeholder="e.g., 45000"
                style={styles.input}
                keyboardType="numeric"
                value={startOdo}
                onChangeText={setStartOdo}
              />
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Ending Odometer *</Text>
              <TextInput
                placeholder="e.g., 45025"
                style={styles.input}
                keyboardType="numeric"
                value={endOdo}
                onChangeText={setEndOdo}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Total Mileage</Text>
              <TextInput
                placeholder="Auto-calculated"
                style={styles.input}
                value={totalMileage}
                editable={false}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Travel Time</Text>
              <TextInput placeholder="Auto-calculated" value={duration} style={styles.input} editable={false} />
            </View>
          </View>
        </View>

        {/* Work Performed Details */}
        <View style={styles.card}>

          <Text style={styles.sectionTitle}>🛠️ Work Performed Details</Text>

          <Text style={styles.label}>Actual Work Description *</Text>
          <TextInput
            placeholder="Describe what was actually completed..."
            style={[styles.input, { height: 80 }]}
            multiline
            value={workDescription}
            onChangeText={setWorkDescription}
          />


          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Equipment Condition *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedEquipmentCondition}
                  onValueChange={(value) => setSelectedEquipmentCondition(value)}
                  style={styles.pickerStyle}
                >
                  <Picker.Item label="Select equipment condition" value="" />
                  {equipmentConditions.map((item) => (
                    <Picker.Item key={item.id} label={item.name} value={item.name} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Time on Site</Text>
              <TextInput
                placeholder="e.g., 2h 30m"
                style={styles.input}
                value={timeOnSite}
                onChangeText={setTimeOnSite}
              />

            </View>
          </View>

          <Text style={styles.label}>Parts/Materials Used</Text>
          <TextInput
            placeholder="List all parts and materials..."
            style={[styles.input, { height: 80 }]}
            multiline
            value={partsUsed}
            onChangeText={setPartsUsed}
          />

        </View>

        {/* Issues & Observations */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>⚠ Issues & Observations</Text>

          <Text style={styles.label}>Root Cause Identified *</Text>
          <TextInput
            style={styles.textarea}
            placeholder="What caused the problem..."
            multiline
            value={rootCause}
            onChangeText={setRootCause}
          />


          <Text style={styles.label}>Resolution / Action Taken *</Text>
          <TextInput
            style={styles.textarea}
            placeholder="How the issue was resolved..."
            multiline
            value={resolutionTaken}
            onChangeText={setResolutionTaken}
          />


          <Text style={styles.label}>Technician Notes / Comments</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Additional observations..."
            multiline
            value={technicianNotes}
            onChangeText={setTechnicianNotes}
          />


          <Text style={styles.label}>Job Status *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedTripStatus}
              onValueChange={(value) => setSelectedTripStatus(value)}
              style={styles.pickerStyle}
            >
              <Picker.Item label="Select job status" value="" />
              {tripStatuses.map((item) => (
                <Picker.Item key={item.id} label={item.name} value={item.name} />
              ))}
            </Picker>
          </View>

        </View>

        {/* Documentation */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📸  Documentation</Text>

          {/* BEFORE PHOTO */}
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Before Photo</Text>

            <View style={styles.row}>
              <TouchableOpacity style={styles.smallBtn} onPress={openCameraBefore}>
                <Text style={styles.smallBtnText}>📷 Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.smallBtn} onPress={openGalleryBefore}>
                <Text style={styles.smallBtnText}>🖼 Gallery</Text>
              </TouchableOpacity>
            </View>

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

            <View style={styles.row}>
              <TouchableOpacity style={styles.smallBtn} onPress={openCameraAfter}>
                <Text style={styles.smallBtnText}>📷 Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.smallBtn} onPress={openGalleryAfter}>
                <Text style={styles.smallBtnText}>🖼 Gallery</Text>
              </TouchableOpacity>
            </View>

            {afterImage && (
              <Image
                source={{ uri: afterImage }}
                style={styles.previewImage}
              />
            )}
          </View>


          {/* DOCUMENTATION */}
          <View style={styles.block}>
            <Text style={styles.blockTitle}>📄 Additional Attachments </Text>

            <TouchableOpacity style={styles.docBtn} onPress={openDocument}>
              <Text style={styles.docBtnText}>📄 Upload Document</Text>
            </TouchableOpacity>

            {documentFile && (
              <Text style={{ marginTop: 6, color: "green", fontWeight: "600" }}>
                Selected: {documentFile.name}
              </Text>
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
