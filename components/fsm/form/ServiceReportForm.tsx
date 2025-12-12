import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Linking,
    Alert,
    FlatList,
} from "react-native";
import FormHeader from "../../common/FormHeader";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuthStore } from "../../../store/useAuthStore";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { api } from "@/src/api/cilent";
import { Ionicons } from "@expo/vector-icons";

type ServiceReportFormRouteProp = RouteProp<
    SearchMenuStackParamList,
    "ServiceReportForm"
>;

export default function ServiceReportForm() {
    const navigation =
        useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();
    const route = useRoute<ServiceReportFormRouteProp>();
    const { mode = "create", report } = route.params || {};
    const [currentMode, setCurrentMode] = useState(mode);

    const isCreateMode = currentMode === "create";
    const isEditMode = currentMode === "edit";
    const isViewMode = currentMode === "view";
    const isEditable = isCreateMode || isEditMode;
    // Inside your component, before handleChange:
    const [workOrderText, setWorkOrderText] = useState(""); // for display in TextInput
    const [userText, setUserText] = useState(""); // for display in TextInput

    const [workOrderOptions, setWorkOrderOptions] = useState<{ id: string; title: string }[]>([]);
    const [userOptions, setUserOptions] = useState<{ id: string; name: string }[]>([]);


    // Form state
    const [formData, setFormData] = useState({
        workOrder: report?.work_order_id || "", // ideally ID
        submittedBy: report?.submitted_by || "", // ideally ID
        reportText: report?.report_text || "",
        reportFileUrl: report?.report_file_url || "",
    });

    const token = useAuthStore.getState().token;
    console.log('🔑 Token being sent:', token);

    const handleChange = (key: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    // System fields coming from existing report
    const created_by_name =
        report?.created_by_first_name && report?.created_by_last_name
            ? `${report.created_by_first_name} ${report.created_by_last_name}`
            : report?.created_by_name || "-";

    const updated_by_name =
        report?.updated_by_first_name && report?.updated_by_last_name
            ? `${report.updated_by_first_name} ${report.updated_by_last_name}`
            : report?.updated_by_name || "-";

    const created_at = report?.created_at || null;
    const updated_at = report?.updated_at || null;

    const searchWorkOrders = async (query: string) => {
        try {
            const res = await api.get<{ id: string; title: string }[]>(`/service_reports/work_orders/search?q=${query}`);
            setWorkOrderOptions(res); // ✅ res is typed now
        } catch (err) {
            console.error(err);
            setWorkOrderOptions([]);
        }
    };

    const searchUsers = async (query: string) => {
        try {
            const res = await api.get<{ id: string; name: string }[]>(`/service_reports/users/search?q=${query}`);
            setUserOptions(res); // ✅ res is typed now
        } catch (err) {
            console.error(err);
            setUserOptions([]);
        }
    };

    // Open file URL
    const handleOpenFile = () => {
        if (formData.reportFileUrl) {
            Linking.openURL(formData.reportFileUrl).catch(() =>
                alert("Cannot open file URL")
            );
        }
    };

    const handleSave = async (saveNew = false) => {
        try {
            console.log("🔹 Form Data being sent:", formData);

            if (isCreateMode) {
                const response = await api.post("/service_reports", {
                    work_order_id: formData.workOrder,  // UUID
                    submitted_by: formData.submittedBy,
                    report_text: formData.reportText,
                    report_file_url: formData.reportFileUrl,
                });
                console.log("✅ Service report created:", response);
                alert("Service report created successfully!");
            } else if (isEditMode && report?.id) {
                const response = await api.put(`/service_reports/${report.id}`, {
                    work_order_id: formData.workOrder,
                    submitted_by: formData.submittedBy,
                    report_text: formData.reportText,
                    report_file_url: formData.reportFileUrl,
                });
                console.log("✅ Service report updated:", response);
                alert("Service report updated successfully!");
                setCurrentMode("view");
            }

            if (saveNew) {
                // Reset form for new entry
                setFormData({
                    workOrder: "",
                    submittedBy: "",
                    reportText: "",
                    reportFileUrl: "",
                });
                setCurrentMode("create");
            } else {
                navigation.goBack();
            }
        } catch (err: any) {
            console.error("❌ Error saving service report:", err.response || err);
            alert(err?.message || "Failed to save service report");
        }
    };

    // Inside component
    useEffect(() => {
        if (report) {
            setWorkOrderText(report.work_order_title || "");
            setUserText(`${report.submitter_first_name || ""} ${report.submitter_last_name || ""}`);
        }
    }, [report]);

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
        <View style={{ flex: 1, backgroundColor: "#FFF" }}>
            <FormHeader
                title={
                    isCreateMode
                        ? "Add Service Report"
                        : isEditMode
                            ? "Edit Service Report"
                            : "View Service Report"
                }
                subtitle={
                    isCreateMode
                        ? "Create a new field service report"
                        : isEditMode
                            ? "Update your service report details"
                            : "View submitted report details"
                }
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={styles.container}>
                {/* SECTION HEADER */}
                <View style={styles.topBar}>
                    <Text style={styles.sectionTitle}>Report Details</Text>

                    {isViewMode && (
                        <View style={styles.iconBtnRow}>
                            <TouchableOpacity
                                style={[styles.iconBtn, { backgroundColor: "#1C95F9" }]}
                                onPress={() => setCurrentMode("edit")}
                            >
                                <Ionicons name="create-outline" size={20} color="#FFF" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.iconBtn, { backgroundColor: "#E53935" }]}
                            // onPress={handleDelete}
                            >
                                <Ionicons name="trash-outline" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* FORM SECTION */}
                <View style={styles.formSection}>
                    <Text style={styles.subHeader}>RELATIONSHIPS</Text>

                    <Text style={styles.label}>Work Order *</Text>

                    {!isEditable ? (
                        // VIEW MODE
                        <View style={styles.readOnlyView}>
                            <Text style={styles.readOnlyText}>{workOrderText || "-"}</Text>
                        </View>
                    ) : (
                        // CREATE / EDIT
                        <TextInput
                            style={styles.input}
                            value={workOrderText}
                            onChangeText={(t) => {
                                setWorkOrderText(t);
                                searchWorkOrders(t);
                            }}
                            placeholder="Search work order"
                        />
                    )}

                    <FlatList
                        data={workOrderOptions}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    setFormData({ ...formData, workOrder: item.id });
                                    setWorkOrderText(item.title);
                                    setWorkOrderOptions([]);
                                }}
                            >
                                <Text>{item.title}</Text>
                            </TouchableOpacity>
                        )}
                    />


                    <Text style={styles.label}>Submitted By *</Text>

                    {!isEditable ? (
                        <View style={styles.readOnlyView}>
                            <Text style={styles.readOnlyText}>{userText || "-"}</Text>
                        </View>
                    ) : (
                        <TextInput
                            style={styles.input}
                            value={userText}
                            onChangeText={(t) => {
                                setUserText(t);
                                searchUsers(t);
                            }}
                            placeholder="Search technician"
                        />
                    )}

                    <FlatList
                        data={userOptions}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    setFormData({ ...formData, submittedBy: item.id });
                                    setUserText(item.name);
                                    setUserOptions([]);
                                }}
                            >
                                <Text>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />



                    <Text style={styles.subHeader}>REPORT CONTENT</Text>

                    <Text style={styles.label}>Report File URL</Text>

                    {!isEditable ? (
                        <View style={styles.readOnlyView}>
                            <Text style={styles.readOnlyText}>{formData.reportFileUrl || "-"}</Text>
                        </View>
                    ) : (
                        <TextInput
                            style={styles.input}
                            value={formData.reportFileUrl}
                            onChangeText={(t) => handleChange("reportFileUrl", t)}
                            placeholder="http://example.com"
                        />
                    )}

                    {formData.reportFileUrl !== "" && (
                        <TouchableOpacity style={styles.fileBtn} onPress={handleOpenFile}>
                            <Ionicons name="attach-outline" size={16} color="#6B4EFF" />
                            <Text style={styles.fileText}>Open File</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={styles.sectionTitle}>System Information</Text>
                {isViewMode && (
                    <View style={styles.systemInfo}>

                        <View style={styles.infoRow}>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Created by:</Text>
                                <Text style={styles.infoValue}>{created_by_name}</Text>
                            </View>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoLabel}>Updated by:</Text>
                                <Text style={styles.infoValue}>{updated_by_name}</Text>
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


                {/* ACTION BUTTONS */}
                <View style={styles.btnContainer}>
                    {isEditable ? (
                        <>
                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: "#6B4EFF" }]}
                                onPress={() => handleSave(false)}
                            >
                                <Text style={styles.btnText}>Save Report</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: "#00A86B" }]}
                                onPress={() => handleSave(true)}
                            >
                                <Text style={styles.btnText}>Save & New</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: "#555" }]}
                                onPress={() =>
                                    isEditMode ? setCurrentMode("view") : navigation.goBack()
                                }
                            >
                                <Text style={styles.btnText}>Cancel</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            style={[styles.saveBtn, { backgroundColor: "#555" }]}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.btnText}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, paddingBottom: 40 },
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#6B4EFF",
    },

    iconBtnRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10, // use marginRight if gap not supported
    },

    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    },

    formSection: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 8,
    },
    subHeader: {
        fontSize: 14,
        fontWeight: "700",
        color: "#333",
        marginTop: 15,
        marginBottom: 2,
    },
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6B4EFF",
        marginTop: 8,
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: "#CCC",
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 14,
        color: "#222",
        marginTop: 4,
    },
    textArea: {
        borderWidth: 1,
        borderColor: "#CCC",
        borderRadius: 6,
        padding: 12,
        fontSize: 14,
        color: "#222",
        height: 100,
        textAlignVertical: "top",
        marginTop: 4,
    },
    readOnly: {
        backgroundColor: "#F4F4F4",
        color: "#666",
    },
    selectedText: {
        fontSize: 12,
        color: "#666",
        marginTop: 4,
        marginLeft: 4,
    },
    fileBtn: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    fileText: {
        color: "#6B4EFF",
        fontWeight: "500",
        marginLeft: 4,
    },
    btnContainer: {
        marginTop: 24,
    },
    saveBtn: {
        paddingVertical: 12,
        borderRadius: 5,
        marginBottom: 10,
        alignItems: "center",
    },
    btnText: {
        color: "#FFF",
        fontWeight: "600",
        fontSize: 15,
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
    systemInfo: {
        marginBottom: 10,
        padding: 12,
        backgroundColor: "#F9F9F9",
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#E5E5ED",
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