import React, { useState, useEffect, useMemo } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    ActivityIndicator,
} from "react-native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

import { Picker } from "@react-native-picker/picker";
import { JobSchedule } from "@/types/Worker";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { api } from "@/src/api/cilent";
import { Ionicons } from "@expo/vector-icons";

type WorkOrdersScreenProps = {
    navigation: NativeStackNavigationProp<SearchMenuStackParamList, "WorkOrders">;
    route: RouteProp<SearchMenuStackParamList, "WorkOrders">;
};

type WorkOrder = {
    id: string;
    title: string;
    orderNo: string;
    assignedTo: string;
    scheduled: string | null;
    priority: string;
    workOrderStatusName: string;
    schedule_id?: string | null;
};



export default function WorkOrdersScreen({ navigation }: WorkOrdersScreenProps) {
    const [activeTab, setActiveTab] = useState<"open" | "scheduled">("open");
    const [selectedName, setSelectedName] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");

    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [jobSchedules, setJobSchedules] = useState<JobSchedule[]>([]);
    const [employees, setEmployees] = useState<{ id: string; name: string }[]>([
        { id: "all", name: "All" },
    ]);
    const [loading, setLoading] = useState(false);

    // ============================
    // 🔥 FETCH DATA
    // ============================
    const fetchWorkOrders = async () => {
        try {
            setLoading(true);

            // Fetch work orders
            const res = await api.get<{ work_orders: any[] }>("/work_order");
            const workOrdersData = Array.isArray(res) ? res : res.work_orders || [];
            setWorkOrders(
                workOrdersData.map((wo) => ({
                    id: wo.id,
                    orderNo: wo.work_order_number || "#--",
                    title: wo.title || "Untitled",
                    assignedTo: wo.assigned_to_name || "Unassigned",
                    priority: wo.priority_name || "Not Set",
                    workOrderStatusName: wo.status_name || "Pending",
                    scheduled: wo.scheduled_at
                        ? new Date(wo.scheduled_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })
                        : null,
                }))
            );

            // Fetch job schedules
            const schedulesRes = await api.get<JobSchedule[]>("/job_schedules");
            setJobSchedules(schedulesRes || []);
        } catch (err) {
            console.error("Error fetching work orders:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch employees for filter
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await api.get<{ id: string; name: string }[]>(
                    "/job_schedules/users/search?q="
                );
                setEmployees([{ id: "all", name: "All" }, ...res]);
            } catch (err) {
                console.error("Error fetching employees:", err);
            }
        };

        fetchEmployees();
    }, []);

    useEffect(() => {
        fetchWorkOrders();
    }, [selectedName, selectedStatus]);

    // ============================
    // 🔥 OPEN / SCHEDULED LOGIC
    // ============================
    // ============================
    // 🔥 OPEN / SCHEDULED LOGIC (Updated as requested)
    // ============================
    const scheduledWorkOrders = useMemo(() => {
        // Work orders that have job schedules
        const scheduledIds = jobSchedules.map((job) => job.work_order_id);

        // Return work orders that are scheduled
        return workOrders.filter((order) =>
            scheduledIds.includes(order.id) || order.scheduled !== null
        );
    }, [workOrders, jobSchedules]);

    const openWorkOrders = useMemo(() => {
        // Work orders that have job schedules
        const scheduledIds = jobSchedules.map((job) => job.work_order_id);

        // Return work orders that are NOT scheduled
        return workOrders.filter(
            (order) =>
                !scheduledIds.includes(order.id) && order.scheduled === null
        );
    }, [workOrders, jobSchedules]);


    // ============================
    // 🔥 RENDER
    // ============================
    const renderWorkOrderCard = (item: WorkOrder) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.statusTag}>
                    <Text style={styles.statusText}>{item.workOrderStatusName}</Text>
                </View>
            </View>

            <Text style={styles.cardText}>Order #{item.orderNo}</Text>
            <Text style={styles.cardText}>Assigned To: {item.assignedTo}</Text>
            <Text style={styles.cardText}>
                Scheduled: {item.scheduled || "Not Set"}
            </Text>
            <Text style={styles.cardText}>Priority: {item.priority}</Text>

            <TouchableOpacity
  style={styles.scheduledLabel}
  onPress={() => {
    // Find the schedule for this work order
    const schedule = jobSchedules.find(
      (s) => s.work_order_id === item.id
    );

    navigation.navigate("CreateSchedule", {
      mode: "edit",
      event: {
        id: schedule?.id ?? null,
        work_order_id: item.id,
        work_order_title: item.title,
         assigned_to: schedule?.assigned_to ?? { id: schedule?.assigned_to_id ?? "", name: schedule?.assigned_to_name ?? "" }, // <-- object
        assigned_to_id: schedule?.assigned_to_id ?? "",
        assigned_to_name: schedule?.assigned_to_name ?? "",
        trip_id: schedule?.trip_id ?? null,
        start_datetime: schedule?.start_datetime ?? null,
        end_datetime: schedule?.end_datetime ?? null,
        dispatch_mode: schedule?.dispatch_mode ?? "Manual",
        notes: schedule?.notes ?? "",
        latitude: schedule?.latitude ?? null,
        longitude: schedule?.longitude ?? null,
        duration_minutes: schedule?.duration_minutes ,
        schedule_status: schedule?.schedule_status ?? "Scheduled",
      },
    });
  }}
>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
    <Ionicons name="pencil-outline" size={10} color="#6C35D1" />
    <Text style={styles.scheduledLabelText}>Edit</Text>
  </View>
</TouchableOpacity>

        </View>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.backIcon}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>

            {/* Filters */}
            <View style={styles.filterRow}>
                <View style={styles.filterBox}>
                    <Ionicons name="person-outline" size={22} color="#6C35D1" />
                    <Picker
                        selectedValue={selectedName}
                        onValueChange={setSelectedName}
                        style={styles.picker}
                        dropdownIconColor="#6C35D1"
                    >
                        {employees.map((emp) => (
                            <Picker.Item key={emp.id} label={emp.name} value={emp.id} />
                        ))}
                    </Picker>
                </View>

                <View style={styles.filterBox}>
                    <Ionicons name="options-outline" size={22} color="#6C35D1" />
                    <Picker
                        selectedValue={selectedStatus}
                        onValueChange={setSelectedStatus}
                        style={styles.picker}
                        dropdownIconColor="#6C35D1"
                    >
                        <Picker.Item label="All" value="all" />
                        <Picker.Item label="Scheduled" value="scheduled" />
                        <Picker.Item label="Rescheduled" value="rescheduled" />
                        <Picker.Item label="Missed" value="missed" />
                        <Picker.Item label="Completed" value="completed" />
                    </Picker>
                </View>
            </View>

            <TouchableOpacity
                style={styles.calendarBtn}
                onPress={() =>
                    navigation.navigate("Schedule", {
                        employeeId: selectedName,
                        statusFilter: selectedStatus,
                    })
                }
            >
                <Ionicons name="calendar-outline" size={20} color="#FFF" />
                <Text style={styles.calendarBtnText}>View Calendar</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Work Orders</Text>

            {/* Tabs */}
            <View style={styles.tabRow}>
                <TouchableOpacity
                    onPress={() => setActiveTab("open")}
                    style={[styles.tab, activeTab === "open" && styles.activeTab]}
                >
                    <Text
                        style={[styles.tabText, activeTab === "open" && styles.activeTabText]}
                    >
                        Open
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveTab("scheduled")}
                    style={[styles.tab, activeTab === "scheduled" && styles.activeTab]}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "scheduled" && styles.activeTabText,
                        ]}
                    >
                        Scheduled
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Work Orders List */}
            {loading ? (
                <ActivityIndicator size="large" color="#6C35D1" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={activeTab === "open" ? openWorkOrders : scheduledWorkOrders}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => renderWorkOrderCard(item)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF", padding: 16 },
    backIcon: { alignSelf: "flex-start", marginBottom: 8 },
    filterRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        marginBottom: 15,
        marginTop: 20,
    },
    filterBox: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#6C35D1",
        borderRadius: 5,
        paddingHorizontal: 10,
        minWidth: 184,
        justifyContent: "center",
        gap: 15,
        height: 45,
    },
    calendarBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#6C35D1",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 6,
        marginTop: 5,
        marginBottom: 8,
        alignSelf: "center",
        width: "60%",
    },
    calendarBtnText: {
        color: "#FFF",
        marginLeft: 10,
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
    },
    picker: { flex: 1, color: "#6C35D1", fontSize: 12, marginLeft: 8 },
    title: { fontSize: 16, fontWeight: "600", color: "#000", marginBottom: 10 },
    tabRow: {
        flexDirection: "row",
        borderWidth: 1,
        borderColor: "#6C35D1",
        borderRadius: 5,
        overflow: "hidden",
        marginBottom: 12,
    },
    tab: { flex: 1, paddingVertical: 10, alignItems: "center", backgroundColor: "#FFF" },
    activeTab: { backgroundColor: "#6C35D1" },
    tabText: { color: "#6C35D1", fontWeight: "600" },
    activeTabText: { color: "#FFF" },
    card: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: 14,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6,
        borderWidth: 0.1,
        borderColor: "rgba(0,0,0,0.05)",
    },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    cardTitle: { fontWeight: "700", fontSize: 14, color: "#333" },
    statusTag: {
        borderWidth: 1,
        borderColor: "#F0C84D",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
        backgroundColor: "#FFF9E6",
    },
    statusText: { fontSize: 10, color: "#C5A200", fontWeight: "600" },
    cardText: { fontSize: 12, color: "#444", marginTop: 2 },
    scheduledLabel: {
        position: "absolute",
        right: 12,
        bottom: 10,
        borderWidth: 1,
        borderColor: "#6C35D1",
        borderRadius: 3,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: "#F5EDFF",
    },
    scheduledLabelText: { fontSize: 10, color: "#434156", fontWeight: "600" },
});
