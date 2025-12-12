import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import FormHeader from "../../common/FormHeader";
import SearchDropdown from "../../common/searchDropdown";
import { workCompletionService } from "@/src/api/auth";
import { Ionicons } from "@expo/vector-icons";


interface WorkOrderOption {
    id: string;
    title: string;
}

interface UserOption {
    id: string;
    name: string;
}

export default function WorkCompletionForm() {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { mode = "create", workCompletion } = route.params || {};

    const [currentMode, setCurrentMode] = useState(mode);
    const [formTitle, setFormTitle] = useState("");
    const [formSubtitle, setFormSubtitle] = useState("");

    useEffect(() => {
        switch (currentMode) {
            case "view":
                setFormTitle("View Work Completion Status");
                setFormSubtitle("View existing work status details");
                break;
            case "edit":
                setFormTitle("Edit Work Completion Status");
                setFormSubtitle("Update existing work status");
                break;
            default:
                setFormTitle("Add Work Completion Status");
                setFormSubtitle("Create a new completion status");
                break;
        }
    }, [currentMode]);

    // 🧾 Form States
    const [workOrder, setWorkOrder] = useState<WorkOrderOption | null>(
        workCompletion
            ? { id: workCompletion.work_order_id, title: workCompletion.work_order_title || "" }
            : null
    );
    const [verifiedBy, setVerifiedBy] = useState<UserOption | null>(
        workCompletion?.verified_by
            ? {
                id: workCompletion.verified_by,
                name: `${workCompletion.verifier_first_name || ""} ${workCompletion.verifier_last_name || ""}`.trim(),
            }
            : null
    );

    const [status, setStatus] = useState(workCompletion?.status || "");
    const [notes, setNotes] = useState(workCompletion?.notes || "");

    // 🔍 Dropdown Data
    const [workOrderResults, setWorkOrderResults] = useState<WorkOrderOption[]>([]);
    const [userResults, setUserResults] = useState<UserOption[]>([]);

    // 🔎 Search Work Orders
    const handleWorkOrderSearch = async (query: string) => {
        if (!query) return setWorkOrderResults([]);
        try {
            const res = await workCompletionService.searchWorkOrders(query);
            const results = Array.isArray(res)
                ? res.map((item: any) => ({
                    id: item.id,
                    title: item.work_order_title || item.title || "Untitled",
                }))
                : [];
            setWorkOrderResults(results);
        } catch (err) {
            console.error("Work order search failed:", err);
        }
    };

    // 🔎 Search Users
    const handleUserSearch = async (query: string) => {
        if (!query) return setUserResults([]);
        try {
            const res = await workCompletionService.searchUsers(query);
            const results = Array.isArray(res)
                ? res.map((item: any) => ({
                    id: item.id,
                    name: item.first_name || item.name || item.username, // ✅ use first_name if available
                }))
                : [];
            setUserResults(results);
        } catch (err) {
            console.error("User search failed:", err);
        }
    };

    const created_by = workCompletion?.created_by_name || "-";
    const updated_by = workCompletion?.updated_by_name || "-";


    const created_at = workCompletion?.created_at || "";
    const updated_at = workCompletion?.updated_at || "";


    const handleSave = async () => {
        if (!workOrder?.id || !status) {
            Alert.alert("Missing Fields", "Please select a Work Order and Status.");
            return;
        }

        // 🕒 Auto generate current timestamp
        const currentTime = new Date().toISOString();

        const payload = {
            work_order_id: workOrder.id,
            verified_by: verifiedBy?.id || "", // ✅ string only
            status,
            notes: notes || "",
            verified_at: currentTime, // ✅ store current date/time
        };

        try {
            if (currentMode === "edit" && workCompletion?.id) {
                await workCompletionService.update(workCompletion.id, payload);
                Alert.alert("Updated", "Work completion status updated successfully.");
            } else {
                await workCompletionService.create(payload);
                Alert.alert("Saved", "Work completion status created successfully.");
            }
            navigation.goBack();
        } catch (err: any) {
            console.error("❌ Error saving record:", err);
            Alert.alert("Error", err.message || "Failed to save record");
        }
    };



    // 🗑️ Delete
    const handleDelete = async () => {
        Alert.alert("Confirm Delete", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await workCompletionService.remove(workCompletion?.id);
                        Alert.alert("Deleted", "Record removed successfully.");
                        navigation.goBack();
                    } catch (err: any) {
                        Alert.alert("Error", err.message || "Delete failed");
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
                title={formTitle}
                subtitle={formSubtitle}
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView style={styles.container}>
                {/* Header Actions */}
                <View style={styles.headerRow}>
                    <Text style={styles.title}>Status Details</Text>
                    {currentMode === "view" && (
                        <View style={styles.iconBtnRow}>
                            <TouchableOpacity
                                style={[styles.iconBtn, { backgroundColor: "#1C95F9" }]}
                                onPress={() => setCurrentMode("edit")}
                            >
                                <Ionicons name="create-outline" size={20} color="#FFF" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.iconBtn, { backgroundColor: "#E53935" }]}
                                onPress={handleDelete}
                            >
                                <Ionicons name="trash-outline" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <Text style={styles.sectionLabel}>Relationships</Text>

                {/* Work Order */}
                {currentMode === "view" ? (
                    <View style={styles.readOnlyView}>
                        <Text style={styles.label}>Work Order</Text>
                        <Text style={styles.readOnlyText}>{workOrder?.title || "-"}</Text>
                    </View>
                ) : (
                    <SearchDropdown
                        label="Work Order *"
                        placeholder="Search work order"
                        value={workOrder?.title || ""}
                        data={workOrderResults.map((item) => item.title)}
                        onSelect={(val) => {
                            const selected = workOrderResults.find((item) => item.title === val);
                            if (selected) setWorkOrder(selected);
                        }}
                        editable={currentMode !== "view"}
                        onSearch={handleWorkOrderSearch}
                        readOnlyValue={workOrder?.title || ""}
                    />
                )}


                {/* Verified By */}
                {currentMode === "view" ? (
                    <View style={styles.readOnlyView}>
                        <Text style={styles.label}>Verified By</Text>
                        <Text style={styles.readOnlyText}>{verifiedBy?.name || "-"}</Text>
                    </View>
                ) : (
                    <SearchDropdown
                        label="Verified By"
                        placeholder="Search verifier"
                        value={verifiedBy?.name || ""}
                        data={userResults.map((item) => item.name)}
                        onSelect={(val) => {
                            const selected = userResults.find((item) => item.name === val);
                            if (selected) setVerifiedBy(selected);
                        }}
                        editable={currentMode !== "view"}
                        onSearch={handleUserSearch}
                        readOnlyValue={verifiedBy?.name || ""}
                    />
                )}


                {/* Status */}
                <Text style={styles.label}>Status *</Text>
                {currentMode === "view" ? (
                    <View style={styles.readOnlyView}>
                        <Text style={styles.readOnlyText}>{status || "-"}</Text>
                    </View>
                ) : (
                    <View style={styles.pickerContainer}>
                        <Picker
                            enabled={currentMode !== "view"}
                            selectedValue={status}
                            onValueChange={(itemValue) => setStatus(itemValue)}
                        >
                            <Picker.Item label="Select Status" value="" />
                            <Picker.Item label="Completed" value="Completed" />
                            <Picker.Item label="In Progress" value="In Progress" />
                            <Picker.Item label="Pending Reviews" value="Pending Reviews" />
                            <Picker.Item label="Rejected" value="Rejected" />
                        </Picker>
                    </View>
                )}

                {/* 🔹 Notes */}
                <Text style={styles.label}>Notes</Text>
                {currentMode === "view" ? (
                    <View style={styles.readOnlyView}>
                        <Text style={styles.readOnlyText}>{notes || "-"}</Text>
                    </View>
                ) : (
                    <TextInput
                        style={[styles.textArea, currentMode === "view" && styles.readonlyInput]}
                        placeholder="Add Notes"
                        value={notes}
                        onChangeText={setNotes}
                        editable={currentMode !== "view"}
                        multiline
                    />
                )}

                <Text style={styles.sectionLabel}>System Information</Text>
                {currentMode === "view" && (
                    <View style={styles.systemInfo}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Created by:</Text>
                                <Text style={styles.infoValue}>{created_by}</Text>
                            </View>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Updated by:</Text>
                                <Text style={styles.infoValue}>{updated_by}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Created at:</Text>
                                <Text style={styles.infoValue}>{formatDate(created_at)}</Text>
                            </View>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Updated at:</Text>
                                <Text style={styles.infoValue}>{formatDate(updated_at)}</Text>
                            </View>
                        </View>
                    </View>
                )}


                {currentMode !== "view" && (
                    <View>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: "#6B4EFF" }]}
                            onPress={handleSave}
                        >
                            <Text style={styles.buttonText}>
                                {currentMode === "edit" ? "Update Status" : "Save Status"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.saveBtn, { backgroundColor: "#00A86B" }]}
                            onPress={handleSave}
                        >
                            <Text style={styles.btnText}>Save & New</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.saveBtn, { backgroundColor: "#555" }]}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    title: { fontSize: 16, fontWeight: "600", color: "#111" },
    sectionLabel: {
        color: "#6B4EFF",
        fontSize: 12,
        fontWeight: "600",
        marginVertical: 10,
        textTransform: "uppercase",
    },
    pickerContainer: {
        backgroundColor: "#E5E5E5",
        borderRadius: 5,
        marginBottom: 16,
    },
    label: { fontSize: 12, fontWeight: "600", color: "#6234E2", marginBottom: 6 },
    textArea: {
        borderWidth: 1,
        borderColor: "#DDD",
        borderRadius: 5,
        backgroundColor: "#F5F5F5",
        padding: 10,
        height: 80,
        marginBottom: 16,
    },
    button: {
        borderRadius: 6,
        padding: 14,
        alignItems: "center",
        marginVertical: 6,
    },
    saveBtn: {
        borderRadius: 6,
        padding: 12,
        alignItems: "center",
        marginVertical: 4,
    },
    buttonText: { color: "#FFF", fontWeight: "600" },
    btnText: { color: "#FFF", fontWeight: "600" },
    iconBtnRow: { flexDirection: "row", gap: 8 },
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    readonlyInput: { opacity: 0.6 },
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
