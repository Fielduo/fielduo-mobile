import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Platform,
} from "react-native";

import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

import FormHeader from "../../common/FormHeader";

import SearchDropdown from "../../common/searchDropdown";
import { Picker } from "@react-native-picker/picker";
import { api } from "@/src/api/cilent";
import { Ionicons } from "@expo/vector-icons";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";

type DropdownItem = { id: string; name: string };
type CreateScheduleRouteProp = RouteProp<SearchMenuStackParamList, "CreateSchedule">;

export default function CreateScheduleScreen() {
    const navigation = useNavigation();
    const route = useRoute<CreateScheduleRouteProp>();
    const event = route.params?.event;

    // --- STATE ---
    const [workOrders, setWorkOrders] = useState<DropdownItem[]>([]);
    const [users, setUsers] = useState<DropdownItem[]>([]);
    const [trips, setTrips] = useState<DropdownItem[]>([]);

    const [workOrderId, setWorkOrderId] = useState("");
    const [workOrderName, setWorkOrderName] = useState("");
    const [assignedToId, setAssignedToId] = useState("");
    const [assignedToName, setAssignedToName] = useState("");
    const [tripId, setTripId] = useState("");
    const [tripName, setTripName] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [status, setStatus] = useState("Scheduled");
    const [dispatchMode, setDispatchMode] = useState("Manual");
    const [notes, setNotes] = useState("");

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [duration, setDuration] = useState<number | null>(null);

    // --- HELPERS ---
    const parseDate = (d: string | undefined) => {
        if (!d) return new Date();
        const date = new Date(d);
        return isNaN(date.getTime()) ? new Date() : date;
    };

    const getItemByName = (list: DropdownItem[], name: string) => list.find(i => i.name === name);

    // --- API SEARCH ---
    const searchWorkOrders = async (q: string) => {
        if (!q.trim()) return;
        const data = await api.get<DropdownItem[]>(`/job_schedules/work_orders/search?q=${q}`);
        setWorkOrders(data);
    };

    const searchUsers = async (q: string) => {
        if (!q.trim()) return;
        const data = await api.get<DropdownItem[]>(`/job_schedules/users/search?q=${q}`);
        setUsers(data);
    };

    const searchTrips = async (q: string) => {
        if (!q.trim()) return;
        try {
            const data = await api.get<DropdownItem[]>(`/job_schedules/trips/search?q=${q}`);
            setTrips(data);
        } catch (error) {
            console.log("Trip Search Error:", error);
        }
    };

    useEffect(() => {
        if (!event) return;
        setWorkOrderId(event.work_order_id ?? "");
        setWorkOrderName(event.work_order_title ?? "");
        setAssignedToId(event.assigned_to_id ?? "");

        setAssignedToName(event.assigned_to_name ?? "");

        const tripIdSafe = event.trip_id ?? ""; // ensure string
        setTripId(tripIdSafe);

        // Only add to trips if tripIdSafe exists
        if (tripIdSafe) {
            setTrips([{ id: tripIdSafe, name: `Trip#${tripIdSafe.slice(0, 8)}` }]);
        } else {
            setTrips([]);
        };

        setStartDate(parseDate(event.start_datetime ?? undefined));
        setEndDate(parseDate(event.end_datetime ?? undefined));
        setStatus(event.schedule_status ?? "Scheduled");
        setDispatchMode(event.dispatch_mode ?? "Manual");
        setNotes(event.notes ?? "");
        console.log("Initial WorkOrderId:", event.work_order_id);
        console.log("Initial AssignedToId:", event.assigned_to_id);

    }, [event]);


    // --- DATE & TIME PICKERS ---
    const showStartDateTimePicker = () => {
        if (Platform.OS === "android") {
            DateTimePickerAndroid.open({
                value: startDate,
                mode: "date",
                is24Hour: false,
                onChange: (event, selectedDate) => {
                    if (event.type === "set" && selectedDate) {
                        DateTimePickerAndroid.open({
                            value: selectedDate,
                            mode: "time",
                            is24Hour: false,
                            onChange: (_e, selectedTime) => {
                                if (selectedTime) {
                                    const finalDate = new Date(
                                        selectedDate.getFullYear(),
                                        selectedDate.getMonth(),
                                        selectedDate.getDate(),
                                        selectedTime.getHours(),
                                        selectedTime.getMinutes()
                                    );
                                    setStartDate(finalDate);
                                }
                            },
                        });
                    }
                },
            });
        } else {
            setShowStartPicker(true);
        }
    };

    const showEndDateTimePicker = () => {
        if (Platform.OS === "android") {
            DateTimePickerAndroid.open({
                value: endDate,
                mode: "date",
                is24Hour: false,
                onChange: (event, selectedDate) => {
                    if (event.type === "set" && selectedDate) {
                        DateTimePickerAndroid.open({
                            value: selectedDate,
                            mode: "time",
                            is24Hour: false,
                            onChange: (_e, selectedTime) => {
                                if (selectedTime) {
                                    const finalDate = new Date(
                                        selectedDate.getFullYear(),
                                        selectedDate.getMonth(),
                                        selectedDate.getDate(),
                                        selectedTime.getHours(),
                                        selectedTime.getMinutes()
                                    );
                                    setEndDate(finalDate);
                                }
                            },
                        });
                    }
                },
            });
        } else {
            setShowEndPicker(true);
        }
    };

    // --- CALCULATE DURATION ---
    useEffect(() => {
        const diff = (endDate.getTime() - startDate.getTime()) / (1000 * 60); // minutes
        setDuration(diff > 0 ? diff : 0);
    }, [startDate, endDate]);

    // --- SAVE ---
    const handleSave = async () => {
        // Only check required fields if they are empty
        if (!(workOrderId && workOrderId.trim()) || !(assignedToId && assignedToId.trim())) {
            alert("Work Order and Assigned To are required.");
            return;
        }


        const payload = {
            work_order_id: workOrderId,
            assigned_to: assignedToId || null,
            trip_id: tripId || null,
            start_datetime: startDate,
            end_datetime: endDate,
            duration_minutes: duration || null,
            schedule_status: status,
            dispatch_mode: dispatchMode,
            notes,
            latitude: latitude || null,
            longitude: longitude || null,
        };

        try {
            if (event?.id) {
                await api.put(`/job_schedules/${event.id}`, payload);
                alert("Schedule Updated");
            } else {
                await api.post(`/job_schedules`, payload);
                alert("Schedule Created");
            }
            navigation.goBack();
        } catch (err) {
            console.log("Save Error:", err);
            alert("Failed to save schedule");
        }
    };


    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <FormHeader
                title={event ? "Edit Schedule" : "Create Schedule"}
                subtitle={event ? "Update your existing schedule details." : "Create a new job schedule below."}
                onBackPress={() => navigation.goBack()}
            />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <Text style={styles.headerTitle}>{event ? "Edit Schedule" : "Create Schedule"}</Text>

                {/* Work Order */}
                <SearchDropdown
                    label="Work Order"
                    placeholder="Search Work Order"
                    value={workOrderName}
                    data={workOrders.map(i => i.name)}
                    onSearch={searchWorkOrders}
                    onSelect={(name) => {
                        const sel = getItemByName(workOrders, name);
                        if (sel) {
                            setWorkOrderId(sel.id);       // important!
                            setWorkOrderName(sel.name);
                        }
                        console.log("Selected Work Order:", sel);

                    }}
                />


                {/* Start Date */}
                <Text style={styles.label}>Start Date & Time</Text>
                <TouchableOpacity style={styles.datePicker} onPress={showStartDateTimePicker}>
                    <Text style={styles.dateText}>{startDate.toLocaleString("en-IN")}</Text>
                    <Ionicons name="calendar" size={20} color="#777" />
                </TouchableOpacity>
                {showStartPicker && Platform.OS === "ios" && (
                    <DateTimePicker
                        value={startDate}
                        mode="datetime"
                        display="inline"
                        onChange={(_, selected) => { if (selected) setStartDate(selected); }}
                    />
                )}

                {/* End Date */}
                <Text style={styles.label}>End Date & Time</Text>
                <TouchableOpacity style={styles.datePicker} onPress={showEndDateTimePicker}>
                    <Text style={styles.dateText}>{endDate.toLocaleString("en-IN")}</Text>
                    <Ionicons name="calendar" size={20} color="#777" />
                </TouchableOpacity>
                {showEndPicker && Platform.OS === "ios" && (
                    <DateTimePicker
                        value={endDate}
                        mode="datetime"
                        display="inline"
                        onChange={(_, selected) => { if (selected) setEndDate(selected); }}
                    />
                )}

                <Text style={{ marginTop: 8, color: "#555" }}>
                    Duration: {duration ?? 0} minutes
                </Text>

                {/* Assigned To */}
                <SearchDropdown
                    label="Assigned To"
                    placeholder="Search User"
                    value={assignedToName}
                    data={users.map(i => i.name)}
                    onSearch={searchUsers}
                    onSelect={(name) => {
                        const sel = getItemByName(users, name);
                        if (sel) { setAssignedToId(sel.id); setAssignedToName(sel.name); }
                    }}
                />

                {/* Trip */}
                <SearchDropdown
                    label="Trip ID"
                    placeholder="Search Trip"
                    value={`Trip#${(tripId ?? "").slice(0, 8)}`}

                    data={trips.map(i => i.id)}
                    onSearch={searchTrips}
                    onSelect={(id) => {
                        const sel = trips.find(i => i.id === id);
                        if (sel) setTripId(sel.id);
                    }}
                />

                {/* Status */}
                <Text style={styles.label}>Status</Text>
                <View style={styles.pickerContainer}>
                    <Picker selectedValue={status} onValueChange={setStatus} style={styles.picker}>
                        <Picker.Item label="Select Status" value="" />
                        <Picker.Item label="Scheduled" value="Scheduled" />
                        <Picker.Item label="Rescheduled" value="Rescheduled" />
                        <Picker.Item label="Completed" value="Completed" />
                        <Picker.Item label="Missed" value="Missed" />
                    </Picker>
                </View>

                {/* Dispatch Mode */}
                <Text style={styles.label}>Dispatch Mode</Text>
                <View style={styles.pickerContainer}>
                    <Picker selectedValue={dispatchMode} onValueChange={setDispatchMode} style={styles.picker}>
                        <Picker.Item label="Select Mode" value="" />
                        <Picker.Item label="Manual" value="Manual" />
                        <Picker.Item label="Automatic-Dispatch" value="Automatic-Dispatch" />
                        <Picker.Item label="Optimized" value="Optimized" />
                    </Picker>
                </View>

                {/* Notes */}
                <Text style={styles.label}>Notes (Optional)</Text>
                <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                    placeholder="Enter notes..."
                    multiline
                    value={notes}
                    onChangeText={setNotes}
                />

                {/* Buttons */}
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveText}>{event ? "Update Schedule" : "Create Schedule"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 16 },
    headerTitle: { fontSize: 20, fontWeight: "700", color: "#5A33C2", marginBottom: 16 },
    label: { fontSize: 14, color: "#5A33C2", fontWeight: "600", marginTop: 12, marginBottom: 6 },
    input: { borderWidth: 1, borderColor: "#DDD", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#333", backgroundColor: "#FAFAFA" },
    pickerContainer: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 12 },
    picker: { height: 50, width: "100%" },
    datePicker: { borderWidth: 1, borderColor: "#DDD", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FAFAFA" },
    dateText: { color: "#333", fontSize: 14 },
    saveBtn: { backgroundColor: "#5A33C2", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 24 },
    saveText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    cancelBtn: { backgroundColor: "#333", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 12, marginBottom: 40 },
    cancelText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
