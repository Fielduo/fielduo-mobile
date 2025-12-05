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
import { launchCamera, launchImageLibrary } from "react-native-image-picker";

import FormHeader from "../../common/FormHeader";
import SearchDropdown from "../../common/searchDropdown";
import { api } from "../../../api/client";

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

export default function TripLogForm() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();

  const { mode: initialMode, data } =
    route.params ?? { mode: "create", data: undefined };

  const [mode, setMode] = useState<Mode>(initialMode);
  const [form, setForm] = useState<TripLog>({
    trip_id: "",
    timestamp: "",
    latitude: "",
    longitude: "",
    note: "",
    ...data,
  });

  const [image, setImage] = useState<string | null>(data?.photo ?? null);
  const [tripResults, setTripResults] = useState<TripItem[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const getImageUri = () => {
    if (!image) return "";

    // Already absolute URL
    if (image.startsWith("http") || image.startsWith("file:")) return image;

    // Remove leading slashes
    let relativePath = image.replace(/^\/+/, ""); // "uploads/trip_logs/1763381419915.jpg"

    // Remove leading "uploads/" if present, because backend serves at /v1/uploads
    if (relativePath.startsWith("uploads/")) {
      relativePath = relativePath.replace(/^uploads\//, ""); // "trip_logs/1763381419915.jpg"
    }

    const baseUrl = api.getBaseUrl().replace(/\/+$/, ""); // e.g., "https://fielduo.com"

    // Add only one /v1/uploads prefix
    return `${baseUrl}/uploads/${relativePath}`;
  };
  console.log("Image URI:", getImageUri());

  // Build FormData
  const buildFormData = () => {
    const fd = new FormData();
    fd.append("trip_id", form.trip_id ?? "");
    fd.append("timestamp", form.timestamp ?? "");
    fd.append("latitude", form.latitude ?? "");
    fd.append("longitude", form.longitude ?? "");
    fd.append("note", form.note ?? "");

    if (image && !image.startsWith("http")) {
      fd.append("photo", {
        uri: image,
        name: "trip_photo.jpg",
        type: "image/jpeg",
      } as any);
    }
    return fd;
  };

  // Save (create/update)
  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = buildFormData();
      if (mode === "create") {
        await api.postMultipart("/trip_logs", fd);
      } else {
        await api.putMultipart(`/trip_logs/${form.id}`, fd);
      }
      Alert.alert("Success", "Trip log saved");
      navigation.goBack();
    } catch (err: any) {
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

  /** CAMERA PERMISSION **/
  async function requestCameraPermission() {
    if (Platform.OS !== "android") return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  /** OPEN CAMERA **/
  const openCamera = async () => {
    const permission = await requestCameraPermission();
    if (!permission) {
      Alert.alert("Permission Required", "Please enable camera permission.");
      return;
    }

    launchCamera(
      {
        mediaType: "photo",
        quality: 0.8,
      },
      (res) => {
        if (res.didCancel) return;
        if (res.errorCode) {
          console.log("Camera error:", res.errorMessage);
          return;
        }
        if (res.assets?.[0]?.uri) setImage(res.assets[0].uri);
      }
    );
  };

  /** OPEN GALLERY **/
  const openGallery = async () => {
    launchImageLibrary({ mediaType: "photo" }, (res) => {
      if (res.didCancel) return;
      if (res.assets?.[0]?.uri) setImage(res.assets[0].uri);
    });
  };

  const handleDateChange = (_: any, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) handleChange("timestamp", selected.toISOString());
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

        {/* IMAGE PREVIEW */}
        <Text style={styles.label}>Photo</Text>

        {image ? (
          <Image
            source={{ uri: getImageUri() }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImage}>
            <Text style={{ color: "#999" }}>No photo</Text>
          </View>
        )}

        {mode !== "view" && (
          <View style={styles.row}>
            <TouchableOpacity style={styles.captureBtn} onPress={openCamera}>
              <Text style={styles.saveText}>Capture</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.galleryBtn} onPress={openGallery}>
              <Text style={styles.saveText}>Upload</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TRIP SEARCH */}
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

        {/* TIMESTAMP */}
        <Text style={styles.label}>Timestamp</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => mode !== "view" && setShowDatePicker(true)}
        >
          <Text style={form.timestamp ? styles.dateText : styles.placeholder}>
            {form.timestamp
              ? new Date(form.timestamp).toLocaleString()
              : "Select Date"}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#555" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={form.timestamp ? new Date(form.timestamp) : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={handleDateChange}
          />
        )}

        {/* FIELDS */}
        <Text style={styles.label}>Latitude</Text>
        <TextInput
          style={[styles.input, mode === "view" && styles.disabled]}
          editable={mode !== "view"}
          value={form.latitude}
          onChangeText={(v) => handleChange("latitude", v)}
        />

        <Text style={styles.label}>Longitude</Text>
        <TextInput
          style={[styles.input, mode === "view" && styles.disabled]}
          editable={mode !== "view"}
          value={form.longitude}
          onChangeText={(v) => handleChange("longitude", v)}
        />

        <Text style={styles.label}>Note</Text>
        <TextInput
          style={[styles.input, mode === "view" && styles.disabled]}
          editable={mode !== "view"}
          value={form.note}
          onChangeText={(v) => handleChange("note", v)}
        />

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

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
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

  row: { flexDirection: "row", gap: 20, marginBottom: 20 },

  captureBtn: {
    flex: 1,
    backgroundColor: "#6B4EFF",
    padding: 13,
    borderRadius: 6,
    alignItems: "center",
  },

  galleryBtn: {
    flex: 1,
    backgroundColor: "#1C95F9",
    padding: 13,
    borderRadius: 6,
    alignItems: "center",
  },

  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#f8f8f8",
  },

  dateText: { color: "#333" },
  placeholder: { color: "#aaa" },

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
