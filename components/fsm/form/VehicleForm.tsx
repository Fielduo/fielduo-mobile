import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";

import { Picker } from "@react-native-picker/picker";
import { useRoute, useNavigation } from "@react-navigation/native";
import FormHeader from "../../common/FormHeader";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { vehicleService } from "@/src/api/auth";
import { Ionicons } from "@expo/vector-icons";


type RouteParams = SearchMenuStackParamList["VehicleForm"];

type VehiclePayload = {
    plate_number: string;
    model: string;
    type: string;
    gps_device_id?: string;
    status?: string;
    created_by_name?: string;
    updated_by_name?: string;
    created_at?: string;
    updated_at?: string;
};

export default function VehicleForm() {
    const route = useRoute();
    const navigation =
        useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();
    const { mode, vehicle } = route.params as RouteParams;


    const [formMode, setFormMode] = useState<"create" | "edit" | "view">(mode);
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState<VehiclePayload>({
        plate_number: vehicle?.plate_number || "",
        model: vehicle?.model || "",
        type: vehicle?.type || "",
        gps_device_id: vehicle?.gps_device_id || "",
        status: vehicle?.status || "Active",
    });

    const update = (key: keyof VehiclePayload, value: string) =>
        setData((prev) => ({ ...prev, [key]: value }));

    const readOnly = formMode === "view";

    const handleEdit = () => setFormMode("edit");
    const handleCancel = () => navigation.goBack();

    // ✅ Create / Update
    // ✅ Validation helper
    const validateForm = () => {
        if (!data.plate_number.trim()) {
            Alert.alert("Validation Error", "Plate Number is required");
            return false;
        }
        if (!data.model.trim()) {
            Alert.alert("Validation Error", "Model is required");
            return false;
        }
        if (!data.type.trim()) {
            Alert.alert("Validation Error", "Type is required");
            return false;
        }
        return true;
    };

    // ✅ Create / Update
    const handleSubmit = async () => {
        if (!validateForm()) return; // stop if validation fails

        try {
            setLoading(true);
            if (formMode === "create") {
                await vehicleService.create(data);
                Alert.alert("Success", "Vehicle created successfully!");
            } else if (formMode === "edit" && vehicle?.id) {
                await vehicleService.update(vehicle.id, data);
                Alert.alert("Success", "Vehicle updated successfully!");
            }
            navigation.goBack();
        } catch (err: any) {
            console.error("❌ Error saving vehicle:", err);
            Alert.alert("Error", err?.response?.data?.error || "Failed to save vehicle");
        } finally {
            setLoading(false);
        }
    };


    // ✅ Delete
    const handleDelete = async () => {
        if (!vehicle?.id) return;

        Alert.alert("Confirm Delete", "Are you sure you want to delete this vehicle?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        setLoading(true);
                        await vehicleService.remove(vehicle.id);
                        Alert.alert("Deleted", "Vehicle deleted successfully!");
                        navigation.goBack();
                    } catch (err: any) {
                        console.error("❌ Error deleting vehicle:", err);
                        Alert.alert("Error", err?.response?.data?.error || "Failed to delete vehicle");
                    } finally {
                        setLoading(false);
                    }
                },
            },
        ]);
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
                    formMode === "create"
                        ? "Add New Vehicle"
                        : formMode === "edit"
                            ? "Edit Vehicle"
                            : "Vehicle Details"
                }
                subtitle={
                    formMode === "create"
                        ? "Create a new vehicle record"
                        : formMode === "edit"
                            ? "Update existing vehicle details"
                            : "View vehicle information"
                }
                onBackPress={handleCancel}
            />

            <ScrollView contentContainerStyle={styles.wrapper}>
                <View style={styles.headerRow}>
                    <Text style={styles.sectionTitle}>Vehicle Information</Text>
                    {formMode === "view" && (
                        <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
                           <Ionicons name="pencil-outline" size={20} color="#fff" />

                            <Text style={styles.editBtnText}>Edit</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.card}>
                    {/* Fields */}
                    <Text style={styles.label}>Plate Number *</Text>
                    {readOnly ? (
                        <View style={styles.readOnlyView}>
                            <Text style={styles.readOnlyText}>{data.plate_number || "-"}   </Text>
                        </View>
                    ) : (
                        <TextInput
                            value={data.plate_number}
                            onChangeText={(t) => update("plate_number", t)}
                            style={[styles.input, readOnly && styles.readOnly]}
                            editable={!readOnly}
                            placeholder="ABC-123"
                        />
                    )}
                    <Text style={styles.label}>Model *</Text>
                    {readOnly ? (
                        <View style={styles.readOnlyView}>
                            <Text style={styles.readOnlyText}>{data.model || "-"}   </Text>
                        </View>
                    ) : (
                        <TextInput
                            value={data.model}
                            onChangeText={(t) => update("model", t)}
                            style={[styles.input, readOnly && styles.readOnly]}
                            editable={!readOnly}
                            placeholder="Toyota Camry"
                        />
                    )}
                    <Text style={styles.label}>Type *</Text>
                    {readOnly ? (
                        <View style={styles.readOnlyView}>
                            <Text style={styles.readOnlyText}>{data.type || "-"}   </Text>
                        </View>
                    ) : (
                        <TextInput
                            value={data.type}
                            onChangeText={(t) => update("type", t)}
                            style={[styles.input, readOnly && styles.readOnly]}
                            editable={!readOnly}
                            placeholder="Sedan, Truck, Van"
                        />
                    )}
                    <Text style={styles.label}>GPS Device ID</Text>
                    {readOnly ? (
                        <View style={styles.readOnlyView}>
                            <Text style={styles.readOnlyText}>{data.gps_device_id || "-"}   </Text>
                        </View>
                    ) : (
                        <TextInput
                            value={data.gps_device_id}
                            onChangeText={(t) => update("gps_device_id", t)}
                            style={[styles.input, readOnly && styles.readOnly]}
                            editable={!readOnly}
                            placeholder="GPS - 00123"
                        />
                    )}
                    <Text style={styles.label}>Status</Text>
                    {readOnly ? (
                        <View style={styles.readOnlyView}>
                            <Text style={styles.readOnlyText}>
                                {data.status
                                    ? data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase()
                                    : "-"}
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.pickerWrapper}>
                            <Picker
                                enabled={!readOnly}
                                selectedValue={
                                    data.status
                                        ? data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase()
                                        : "Active"
                                }
                                onValueChange={(v) => update("status", v)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Active" value="Active" />
                                <Picker.Item label="Inactive" value="Inactive" />
                            </Picker>
                        </View>
                    )}

                    <Text style={styles.sectionTitle}>System Information</Text>
                    {readOnly && vehicle && (
                        <View style={styles.systemInfo}>

                            <View style={styles.infoRow}>
                                <View style={styles.infoBox}>
                                    <Text style={styles.infoLabel}>Created by:</Text>
                                    <Text style={styles.infoValue}>{vehicle.created_by_name || "-"}</Text>
                                </View>
                                <View style={styles.infoBox}>
                                    <Text style={styles.infoLabel}>Updated by:</Text>
                                    <Text style={styles.infoValue}>{vehicle.updated_by_name || "-"}</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <View style={styles.infoBox}>
                                    <Text style={styles.infoLabel}>Created at:</Text>
                                    <Text style={styles.infoValue}>
                                        {vehicle.created_at ? formatDate(vehicle.created_at) : "-"}
                                    </Text>
                                </View>
                                <View style={styles.infoBox}>
                                    <Text style={styles.infoLabel}>Updated at:</Text>
                                    <Text style={styles.infoValue}>
                                        {vehicle.updated_at ? formatDate(vehicle.updated_at) : "-"}
                                    </Text>
                                </View>
                            </View>

                        </View>
                    )}

                    {/* Action Buttons */}
                    {formMode === "view" ? (
                        <View style={{ marginTop: 100 }}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelBtn]}
                                onPress={handleCancel}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={handleDelete}
                                disabled={loading}
                            >
                                <Text style={styles.deleteButtonText}>
                                    {loading ? "Deleting..." : "Delete"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={{ marginTop: 40 }}>
                            <TouchableOpacity
                                style={[styles.button, styles.primaryBtn]}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                <Text style={styles.buttonText}>
                                    {loading
                                        ? "Saving..."
                                        : formMode === "create"
                                            ? "Create Vehicle"
                                            : "Update Vehicle"}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: "#00A86B" }]}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                <Text style={styles.btnText}>Save & New</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.cancelBtn]}
                                onPress={handleCancel}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { padding: 16, flexGrow: 1, backgroundColor: "#FFF" },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    sectionTitle: { color: "#222", fontSize: 16, fontWeight: "600" },
    editBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1C95F9",
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 5,
        height: 38,
    },
    editBtnText: { color: "#fff", fontWeight: "700", fontSize: 14, marginLeft: 6 },
    card: { backgroundColor: "#fff", padding: 10 },
    label: { fontSize: 13, color: "#6C35D1", marginBottom: 6, fontWeight: "600" },
    input: {
        backgroundColor: "#EDEDED",
        borderRadius: 5,
        height: 48,
        paddingHorizontal: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#D6D6D6",
        color: "#111",
        fontSize: 14,
    },
    readOnly: { opacity: 0.6 },
    pickerWrapper: {
        backgroundColor: "#EDEDED",
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#D6D6D6",
        height: 48,
        justifyContent: "center",
        marginBottom: 18,
        overflow: "hidden",
    },
    picker: { width: "100%", color: "#111", height: 50 },
    button: {
        height: 46,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    primaryBtn: { backgroundColor: "#6234E2" },
    deleteButton: {
        height: 46,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    deleteButtonText: { color: "#FF1C1C", fontWeight: "700", fontSize: 16 },
    saveBtn: { paddingVertical: 12, borderRadius: 5, marginBottom: 12, alignItems: "center" },
    btnText: { color: "#FFF", fontWeight: "600", fontSize: 15 },
    cancelBtn: { backgroundColor: "#4B4B4B" },
    buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
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
