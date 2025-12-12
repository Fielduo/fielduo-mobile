// ScheduleScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Calendar } from "react-native-calendars";
import Header from "../../common/Header";
import { Dropdown } from "react-native-element-dropdown";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { api } from "@/src/api/cilent";
import { Ionicons } from "@expo/vector-icons";



/**
 * Strongly-typed JobSchedule according to your sample.
 * Keeps index signature for unknown extras coming from API.
 */
export type JobSchedule = {
    id: string;
    assigned_to: string;

    // API fields
    assigned_to_id?: string;
    assigned_to_name?: string;
    work_order_title?: string;
    work_order_id?: string;
    schedule_status?: string;
    start_datetime?: string | null;
    end_datetime?: string | null;
    duration_minutes?: number;
    latitude?: number | string;
    longitude?: number | string;
    route_order?: number;
    is_optimized_route?: boolean;
    notes?: string;
    dispatch_mode?: string;

    // address/trip
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    trip_id?: string;
    trip_name?: string;

    // UI-only fields (optional)
    date?: string;
    title?: string;
    startTime?: string;
    endTime?: string;
    duration?: string;
    color?: string;

    [key: string]: any;
};

type NavProp = NativeStackNavigationProp<SearchMenuStackParamList, "Schedule">;
type RouteP = RouteProp<SearchMenuStackParamList, "Schedule">;

export default function ScheduleScreen() {
    const navigation = useNavigation<NavProp>();
    const route = useRoute<RouteP>();

    const employeeIdParam = route.params?.employeeId;
    const employeeId = employeeIdParam ?? "all";
    const selectedStatusParam = route.params?.statusFilter;
    const selectedStatus = selectedStatusParam ?? "all";

    const [events, setEvents] = useState<JobSchedule[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split("T")[0]
    );
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [filterType, setFilterType] = useState<string | null>("calendar");
    const today = new Date().toISOString().split("T")[0];

    const colorPalette = ["#FFE3C8", "#C8E7FF", "#C8FFC8", "#F5C8FF"];

    const formattedMonth = useMemo(
        () =>
            currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
            }),
        [currentMonth]
    );

    const handlePrevMonth = () => {
        if (filterType === "jobs") return;
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(currentMonth.getMonth() - 1);
        setCurrentMonth(newMonth);
    };
    const handleNextMonth = () => {
        if (filterType === "jobs") return;
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(currentMonth.getMonth() + 1);
        setCurrentMonth(newMonth);
    };

    const safeDateString = (maybe: unknown) => {
        if (maybe == null) return ""; // catches null & undefined
        const str = String(maybe);   // ensures we have a string
        const idx = str.indexOf("T");
        return idx >= 0 ? str.slice(0, idx) : str;
    };


    useEffect(() => {
        if (filterType === "jobs") {
            const today = new Date().toISOString().split("T")[0];
            setSelectedDate(today);
            setViewMode("day"); // force day view
        }
    }, [filterType]);

    // Format date for display
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        return d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };


    // Fetch schedules once (or when filters change)
    useEffect(() => {
        let cancelled = false;

        const getDateOnly = (datetime?: string | null) => {
            if (!datetime) return "";
            const d = new Date(datetime);
            if (isNaN(d.getTime())) return "";
            return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
        };

        const fetchSchedules = async () => {
            try {
                setLoading(true);

                const url =
                    employeeId !== "all"
                        ? `/job_schedules?assigned_to=${employeeId}`
                        : "/job_schedules";

                const scheduleData = await api.get<JobSchedule[]>(url).catch((err) => {
                    console.warn("Primary api.get failed, trying fallback:", err);
                    throw err;
                });

                if (cancelled) return;

                const mapped = (Array.isArray(scheduleData) ? scheduleData : [])
                    .filter((s) => s && (s.start_datetime || s.end_datetime))
                    .map((s, idx) => {
                        const startTime = s.start_datetime
                            ? new Date(s.start_datetime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            : "";
                        const endTime = s.end_datetime
                            ? new Date(s.end_datetime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            : "";

                        return {
                            id: String(s.id ?? `${idx}`),

                            title: s.work_order_title
                                ? `${s.work_order_title} - ${s.assigned_to_name ?? "Unassigned"}`
                                : `Job - ${s.assigned_to_name ?? "Unassigned"}`,
                            assigned_to_id: s.assigned_to_id,

                            date: getDateOnly(s.start_datetime),

                            // Original fields (same as web)
                            work_order_id: s.work_order_id,
                            work_order_title: s.work_order_title,

                            assigned_to: s.assigned_to,
                            assigned_to_name: s.assigned_to_name,
                            schedule_status: s.schedule_status || "Scheduled",
                            dispatch_mode: s.dispatch_mode || "Manual",
                            notes: s.notes,
                            type: s.schedule_status || "Scheduled",
                            route_order: s.route_order || 0,
                            is_optimized_route: s.is_optimized_route || false,
                            trip_id: s.trip_id ?? "",   // instead of potentially null
                            startTime,
                            endTime,
                            start_datetime: s.start_datetime, // <--- add this
                            end_datetime: s.end_datetime,
                            duration:
                                (s.duration_minutes ?? undefined) !== undefined
                                    ? String(s.duration_minutes)
                                    : "",
                            color: colorPalette[idx % colorPalette.length],
                        } as JobSchedule;
                    });

                // Log the mapped schedules
                console.log("Mapped schedules:", mapped);

                const filtered = mapped.filter((e) => {
                    const empOk =
                        employeeId === "all" ||
                        e.assigned_to === employeeId ||
                        e.assigned_to_id === employeeId;
                    const statusOk =
                        selectedStatus === "all" ||
                        (e.schedule_status ?? "").toLowerCase() ===
                        selectedStatus.toLowerCase();
                    return empOk && statusOk;
                });

                // Log after filtering
                console.log("Filtered schedules:", filtered);

                setEvents(filtered);
            } catch (err) {
                console.error("Error fetching schedules:", err);
                Alert.alert("Error", "Unable to fetch schedules.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchSchedules();

        return () => {
            cancelled = true;
        };
    }, [employeeId, selectedStatus]);

    // Visible events depend on viewMode: day => only that date, otherwise full set
    const visibleEvents = useMemo(() => {
        // ⭐ JOBS MODE → only today's jobs
        if (filterType === "jobs") {
            const todayDate = new Date().toISOString().split("T")[0];
            return events.filter((e) => e.date === todayDate);
        }

        // ⭐ DAY MODE → only selected date
        if (viewMode === "day") {
            return events.filter((e) => e.date === selectedDate);
        }

        // ⭐ WEEK MODE → only events for the week of selectedDate
        if (viewMode === "week") {
            const d = new Date(selectedDate);
            const start = new Date(d);
            start.setDate(d.getDate() - d.getDay()); // Sunday
            const end = new Date(start);
            end.setDate(start.getDate() + 6); // Saturday

            return events.filter((e) => {
                if (!e.date) return false;
                const ed = new Date(e.date);
                return ed >= start && ed <= end;
            });
        }

        // ⭐ MONTH MODE → only events of the current month
        if (viewMode === "month") {
            return events.filter((e) => {
                if (!e.date) return false;
                const ed = new Date(e.date);
                return (
                    ed.getMonth() === currentMonth.getMonth() &&
                    ed.getFullYear() === currentMonth.getFullYear()
                );
            });
        }

        return events;
    }, [events, filterType, viewMode, selectedDate, currentMonth]);



    // For calendar marking we want all event dates (not only visibleEvents) so user sees dots across month
    const markedDates = useMemo(() => {
        const marks: Record<string, any> = {};
        events.forEach((e) => {
            const d = e.date ?? "";
            if (!d) return;
            marks[d] = {
                ...(marks[d] || {}),
                marked: true,
                dotColor: "#6C35D1",
            };
        });

        // selected date highlight
        if (selectedDate) {
            marks[selectedDate] = {
                ...(marks[selectedDate] || {}),
                selected: true,
                selectedColor: "#6C35D1",
                selectedTextColor: "#FFF",
            };
        }
        return marks;
    }, [events, selectedDate]);

    // counts used in day component
    const eventsCountByDate: Record<string, number> = useMemo(() => {
        const counts: Record<string, number> = {};
        events.forEach((e) => {
            const d = e.date ?? "";
            if (!d) return;
            counts[d] = (counts[d] || 0) + 1;
        });
        return counts;
    }, [events]);

    // Navigate to route screen with location jobs for selected date (today)
    const handleTodaysRoute = async () => {
        if (employeeId === "all") {
            Alert.alert("Select Worker", "Please select a specific field worker to view their route.");
            return;
        }

        try {
            const today = new Date().toISOString().split("T")[0];
            const url = `/job_schedules/with-locations?date=${today}&assigned_to=${employeeId}`;

            console.log("➡️ API URL:", url);

            const data = await api.get<JobSchedule[]>(url);

            console.log("📥 API RESPONSE (jobs):", data);

            const jobsData = Array.isArray(data) ? data : [];

            if (!jobsData.length) {
                Alert.alert("No jobs", "No jobs scheduled for today.");
                return;
            }

            const jobsWithCoordinates = jobsData.filter(
                (j) => j.latitude !== undefined && j.longitude !== undefined
            );

            console.log("📍 Jobs With Coordinates:", jobsWithCoordinates);

            if (!jobsWithCoordinates.length) {
                Alert.alert("No locations", "No jobs with location data found for today.");
                return;
            }

            console.log("🚀 Navigating to MapRouteScreen with:");
            console.log("   ➤ assignedUserId:", employeeId);
            console.log("   ➤ selectedDate:", today);
            console.log("   ➤ jobs count:", jobsWithCoordinates.length);

            navigation.navigate("MapRouteScreen", {
                jobs: jobsWithCoordinates,
                assignedUserId: employeeId,
                selectedDate: today,
            } as any);

        } catch (err) {
            console.error("🔥 Today's route error:", err);
            Alert.alert("Error", "Error fetching today's route.");
        }
    };


    // UI
    return (
        <View style={{ flex: 1, backgroundColor: "#FFF" }}>
            <Header />

            <View style={styles.container}>
                <View style={styles.topRow}>
                    <Text style={styles.pageTitle}>Schedule</Text>

                    <TouchableOpacity style={styles.routeButton} onPress={handleTodaysRoute}>
                        <Ionicons name="navigate-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                        <Text style={styles.routeText}>Todays Route</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.subHeader}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate({ name: "WorkOrders", params: undefined })}
                    >
                        <Ionicons name="menu" size={28} color="#333" />
                    </TouchableOpacity>

                    <Dropdown
                        style={styles.dropdown}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        data={[
                            { label: "Calendar", value: "calendar" },
                            { label: "Jobs", value: "jobs" },
                        ]}
                        labelField="label"
                        valueField="value"
                        placeholder="Calendar"
                        value={filterType ?? "calendar"}
                        onChange={(item: any) => setFilterType(item?.value ?? "calendar")}
                    />
                </View>

                <View style={styles.calendarBox}>
                    <View style={styles.calendarHeader}>
                        <View style={styles.monthNav}>
                            <TouchableOpacity onPress={handlePrevMonth}>
                                <Ionicons name="chevron-back" size={20} color="#6C35D1" />
                            </TouchableOpacity>
                            <Text style={styles.monthText}>{formattedMonth}</Text>
                            <TouchableOpacity onPress={handleNextMonth}>
                                <Ionicons name="chevron-forward" size={20} color="#6C35D1" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.tabs}>
                            {(["Month", "Week", "Day"] as const).map((mode) => {
                                const lower = mode.toLowerCase() as "month" | "week" | "day";
                                return (
                                    <TouchableOpacity
                                        key={mode}
                                        style={[styles.tab, viewMode === lower && styles.activeTab]}
                                        onPress={() => setViewMode(lower)}
                                    >
                                        <Text style={[styles.tabText, viewMode === lower && styles.activeTabText]}>
                                            {mode}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <Calendar
                        key={currentMonth.toISOString()}
                        current={currentMonth.toISOString().split("T")[0]}
                        onDayPress={(day) => {
                            if (!day?.dateString) return;
                            setSelectedDate(day.dateString);
                            // if user taps a day, switch to 'day' view
                            setViewMode("day");
                        }}
                        markedDates={markedDates}
                        hideArrows
                        disableMonthChange={false}
                        renderHeader={() => <></>}
                        theme={{
                            todayTextColor: "#6C35D1",
                            textMonthFontWeight: "bold",
                            textSectionTitleColor: "#000",
                            monthTextColor: "#000",
                            textDayFontSize: 14,
                            textMonthFontSize: 16,
                        }}
                        dayComponent={({ date, state }) => {
                            if (!date) return null;

                            const dateStr = date.dateString;

                            // Default count
                            let count = eventsCountByDate[dateStr] || 0;

                            // 🔥 Jobs Mode → only today should show events
                            if (filterType === "jobs") {
                                const today = new Date().toISOString().split("T")[0];
                                count = dateStr === today ? count : 0;  // hide all other counts
                            }

                            return (
                                <TouchableOpacity
                                    onPress={() => {
                                        if (filterType === "jobs") {
                                            const today = new Date().toISOString().split("T")[0];
                                            setSelectedDate(today);
                                            setViewMode("day");
                                            return;
                                        }

                                        setSelectedDate(dateStr);
                                        setViewMode("day");
                                    }}
                                    style={{
                                        justifyContent: "center",
                                        alignItems: "center",
                                        padding: 4,
                                        borderRadius: 4,
                                        backgroundColor:
                                            selectedDate === dateStr ? "#6C35D1" : "transparent",
                                    }}
                                >
                                    <Text
                                        style={{
                                            color:
                                                state === "disabled"
                                                    ? "#ccc"
                                                    : selectedDate === dateStr
                                                        ? "#FFF"
                                                        : "#000",
                                            fontSize: 12,
                                        }}
                                    >
                                        {date.day}
                                    </Text>

                                    {count > 0 && (
                                        <Text
                                            style={{
                                                fontSize: 10,
                                                color:
                                                    selectedDate === dateStr ? "#FFF" : "#6C35D1",
                                            }}
                                        >
                                            {`+${count} More`}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>

                <ScrollView style={styles.body}>
                    {loading ? (
                        <ActivityIndicator style={{ marginTop: 20 }} />
                    ) : filterType === "jobs" ? (

                        // ⭐ JOBS MODE — SHOW ONLY TODAY EVENTS
                        visibleEvents.length ? (
                            visibleEvents.map((e) => (
                                <TouchableOpacity
                                    key={e.id}
                                    style={[styles.eventCard, { backgroundColor: e.color ?? "#EFEFEF" }]}
                                    onPress={() =>
                                        navigation.navigate("CreateSchedule", {
                                            mode: "edit",
                                            event: e,
                                        })
                                    }
                                >
                                    <Text style={styles.eventTitle}>{e.title ?? "Untitled"}</Text>
                                    <Text style={styles.eventTime}>
                                        Start: {formatDate(e.start_datetime)}  End: {formatDate(e.end_datetime)}
                                    </Text>
                                    <Text style={styles.eventTime}>
                                        Time: {e.startTime ?? ""}  {e.endTime ?? ""}
                                    </Text>
                                    <Text style={styles.eventDuration}>Duration: {e.duration ?? ""}</Text>
                                    <Text style={styles.eventSmall}>Status: {e.schedule_status ?? "N/A"}</Text>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.noEventsText}>No jobs for today.</Text>
                        )

                    ) : (

                        // ⭐ CALENDAR MODE — NORMAL GROUPING
                        Object.entries(
                            visibleEvents.reduce((acc, e) => {
                                const d = e.date ?? "";
                                const dateObj = d ? new Date(d) : new Date();

                                const formatted = dateObj.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                });
                                const weekday = dateObj.toLocaleDateString("en-US", {
                                    weekday: "short",
                                });

                                const key = `${formatted} ${weekday}`;
                                if (!acc[key]) acc[key] = [];
                                acc[key].push(e);

                                return acc;
                            }, {} as Record<string, JobSchedule[]>)
                        )
                            .map(([dateLabel, dayEvents]) => (
                                <View key={dateLabel} style={styles.dateSection}>
                                    <Text style={styles.dateLabel}>{dateLabel}</Text>
                                    {dayEvents.map((e) => (
                                        <TouchableOpacity
                                            key={e.id}
                                            style={[styles.eventCard, { backgroundColor: e.color ?? "#EFEFEF" }]}
                                            onPress={() =>
                                                navigation.navigate("CreateSchedule", {
                                                    mode: "edit",
                                                    event: e,
                                                })
                                            }
                                        >
                                            <Text style={styles.eventTitle}>{e.title ?? "Untitled"}</Text>
                                            <Text style={styles.eventTime}>
                                                Start: {formatDate(e.start_datetime)}  End: {formatDate(e.end_datetime)}
                                            </Text>
                                            <Text style={styles.eventTime}>
                                                Time: {e.startTime ?? ""}  {e.endTime ?? ""}
                                            </Text>
                                            <Text style={styles.eventDuration}>Duration: {e.duration ?? ""}</Text>
                                            <Text style={styles.eventSmall}>Status: {e.schedule_status ?? "N/A"}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ))
                    )}
                </ScrollView>


                <TouchableOpacity
                    style={styles.fab}
                    onPress={() =>
                        navigation.navigate("CreateSchedule", {
                            mode: "create",
                            event: undefined,
                        } as any)
                    }
                >
                    <Ionicons name="add" size={28} color="#FFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF", paddingTop: 10 },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    pageTitle: { fontSize: 18, fontWeight: "600", color: "#6234E2" },
    routeButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#6C35D1",
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    routeText: { color: "#FFF", fontWeight: "600", fontSize: 14 },
    subHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    dropdown: {
        width: 110,
        height: 38,
        paddingHorizontal: 10,
        backgroundColor: "#FFF",
    },
    placeholderStyle: { fontSize: 14, color: "#101318CC", fontWeight: "600" },
    selectedTextStyle: { fontSize: 13, color: "#6C35D1", fontWeight: "600" },
    calendarBox: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        marginHorizontal: 16,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    calendarHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    monthNav: { flexDirection: "row", alignItems: "center", gap: 6 },
    monthText: { fontSize: 12, fontWeight: "700", color: "#111" },
    tabs: {
        flexDirection: "row",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 6,
        overflow: "hidden",
    },
    tab: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#FFF" },
    activeTab: { backgroundColor: "#6C35D1" },
    tabText: { fontSize: 12, fontWeight: "600", color: "#333" },
    activeTabText: { color: "#FFF" },
    body: { paddingHorizontal: 12, marginBottom: 10, marginTop: 10 },
    eventCard: { borderRadius: 6, padding: 16, marginBottom: 10, marginTop: 5 },
    eventTitle: { fontWeight: "700", fontSize: 14, color: "#333" },
    eventTime: { fontSize: 12, color: "#444", marginTop: 4 },
    eventDuration: { fontSize: 12, color: "#555", marginTop: 2 },
    eventSmall: { fontSize: 11, color: "#333", marginTop: 6 },
    dateSection: { marginBottom: 20 },
    dateLabel: { fontSize: 14, fontWeight: "700", color: "#6C35D1", marginBottom: 8 },
    noEventsText: { textAlign: "center", color: "#888", marginTop: 10 },
    fab: {
        position: "absolute",
        right: 20,
        bottom: 30,
        backgroundColor: "#6C35D1",
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5,
    },
});
