import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ListRenderItem,
    ActivityIndicator,
} from "react-native";

import Header from "../../common/Header";
import HeaderSection from "../../common/HeaderSection";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { api } from "@/src/api/cilent";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import FilterModal, { AppliedFilter } from "@/components/common/FilterModal";



type WorkForceNavigationProp = NativeStackNavigationProp<
    SearchMenuStackParamList,
    "WorkForce"
>;

type FieldWorker = {
    id: string;
    full_name: string;
    email: string;
    mobile: string;
    gender: string;
    city: string;
    skills: string;
    availability: string;
    image?: string;
}

export default function WorkForce() {
    const [workers, setWorkers] = useState<FieldWorker[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string>("just now");
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [selectedAction, setSelectedAction] = useState("Recently Viewed");
    const [viewMode, setViewMode] = useState<'all' | 'recent'>('all');
    const [recentContacts, setRecentContacts] = useState<FieldWorker[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigation = useNavigation<WorkForceNavigationProp>();
    const [filterOpen, setFilterOpen] = useState(false);
    const [appliedFilter, setAppliedFilter] = useState<AppliedFilter | null>(null);
    const [filteredWorkers, setFilteredWorkers] = useState<FieldWorker[]>([]);

    // ✅ Fetch workforce from API
    const fetchWorkers = async () => {
        try {
            setLoading(true);
            const data = await api.get<FieldWorker[]>("/workerforce");
            setWorkers(data);
            setLoading(false);
            setFilteredWorkers(data); // 🔥 default
        } catch (err) {
            console.error("Error fetching workforce:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!appliedFilter) {
            setFilteredWorkers(workers);
            return;
        }

        const { field, operator, value } = appliedFilter;

        const result = workers.filter((item: any) => {
            const itemValue = item[field];
            if (!itemValue) return false;

            if (operator === 'contains') {
                return itemValue
                    .toString()
                    .toLowerCase()
                    .includes(value.toLowerCase());
            }

            if (operator === '=') {
                return itemValue.toString().toLowerCase() === value.toLowerCase();
            }

            if (operator === '>') return itemValue > value;
            if (operator === '<') return itemValue < value;

            return true;
        });

        setFilteredWorkers(result);
    }, [appliedFilter, workers]);

    useEffect(() => {
        fetchWorkers();

        // Optional: last updated timer
        const updatedAt = new Date();
        const interval = setInterval(() => {
            const diff = Math.floor((Date.now() - updatedAt.getTime()) / 60); // minutes
            if (diff === 0) setLastUpdated("just now");
            else if (diff === 1) setLastUpdated("1 minute ago");
            else if (diff < 60) setLastUpdated(`${diff} minutes ago`);
            else {
                const hours = Math.floor(diff / 60);
                setLastUpdated(`${hours} hour${hours > 1 ? "s" : ""} ago`);
            }
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const renderItem: ListRenderItem<FieldWorker> = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.avatarSection}>
                    <Image
                        source={{
                            uri:
                                item.image ||
                                `https://i.pravatar.cc/100?u=${item.id}`, // placeholder if no image
                        }}
                        style={styles.avatar}
                    />
                    <Text style={styles.name}>{item.full_name}</Text>
                </View>
                <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => {
                        // Add worker to recently viewed
                        setRecentContacts(prev => {
                            // Avoid duplicates
                            const exists = prev.find(w => w.id === item.id);
                            if (exists) return prev;
                            // Add to the beginning (most recent first)
                            return [item, ...prev];
                        });

                        // Navigate to view form
                        navigation.navigate("WorkForceForm", {
                            mode: "view",
                            worker: item as unknown as any,
                        });
                    }}
                >
                    <MaterialCommunityIcons name="eye-outline" size={16} color="#fff" />
                    <Text style={styles.viewText}>View</Text>
                </TouchableOpacity>

            </View>

            {/* Info Grid */}
            <View style={styles.infoGrid}>
                <View style={styles.infoBox}>
                    <View style={styles.labelRow}>
                        <Ionicons name="mail-outline" size={16} color="#6C35D1" />

                        <Text style={styles.label}>Email</Text>
                    </View>
                    <Text style={styles.value}>{item.email}</Text>
                </View>
                <View style={styles.infoBox}>
                    <View style={styles.labelRow}>
                        <Ionicons name="call-outline" size={16} color="#6C35D1" />

                        <Text style={styles.label}>Phone</Text>
                    </View>
                    <Text style={styles.value}>{item.mobile}</Text>
                </View>
                <View style={[styles.infoBox, { borderRightWidth: 0 }]}>
                    <View style={styles.labelRow}>
                        <Ionicons name="person-outline" size={16} color="#6C35D1" />

                        <Text style={styles.label}>Gender</Text>
                    </View>
                    <Text style={styles.value}>{item.gender}</Text>
                </View>
            </View>

            <View style={styles.infoGrid}>
                <View style={[styles.infoBox, { borderBottomWidth: 0 }]}>
                    <View style={styles.labelRow}>
                        <Ionicons name="location-outline" size={16} color="#6C35D1" />

                        <Text style={styles.label}>City</Text>
                    </View>
                    <Text style={styles.value}>{item.city}</Text>
                </View>
                <View style={[styles.infoBox, { borderBottomWidth: 0 }]}>
                    <View style={styles.labelRow}>
                        <Ionicons name="settings-outline" size={16} color="#6C35D1" />

                        <Text style={styles.label}>Skills</Text>
                    </View>
                    <Text style={styles.value}>{item.skills}</Text>
                </View>
                <View
                    style={[styles.infoBox, { borderRightWidth: 0, borderBottomWidth: 0 }]}
                >
                    <View style={styles.labelRow}>
                        <Ionicons name="calendar-outline" size={16} color="#6C35D1" />
                        <Text style={styles.label}>Availability</Text>
                    </View>
                    <Text style={styles.value}>{item.availability}</Text>
                </View>
            </View>
        </View>
    );

    if (loading) return <ActivityIndicator size="large" color="#6234E2" style={{ flex: 1 }} />;
    const displayContacts =
        viewMode === 'recent' ? recentContacts : filteredWorkers;

    return (
        <View style={{ flex: 1, backgroundColor: "#FFF" }}>
            <Header />
            <HeaderSection
                title="What services do you need?"
                buttonText="+ New Field"
                onButtonClick={() =>
                    navigation.navigate("WorkForceForm", { mode: "create" })
                }
                onSearchPress={() => setFilterOpen(true)} // ✅ SEARCH CLICK
            />

            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.fsm}>FSM</Text>
                        <Text style={styles.sectionTitle}>Field Workers</Text>
                        <Text style={styles.sectionSubTitle}>
                            {workers.length} items • Updated {lastUpdated}
                        </Text>
                    </View>
                    {/* Dropdown code remains same */}
                    <View style={{ position: 'relative' }}>
                        <TouchableOpacity
                            style={styles.filterBtn}
                            onPress={() => setDropdownOpen((p) => !p)}
                        >
                            <Text style={styles.filterText}>
                                {viewMode === 'all' ? 'All' : 'Recently Viewed'}
                            </Text>
                            <Ionicons name="chevron-down-outline" size={16} color="#444" />
                        </TouchableOpacity>

                        {dropdownOpen && (
                            <View style={styles.dropdown}>
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setViewMode('all');
                                        setDropdownOpen(false);
                                    }}
                                >
                                    <Text>All</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setViewMode('recent');
                                        setDropdownOpen(false);
                                    }}
                                >
                                    <Text>Recently Viewed</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                <FlatList
                    data={displayContacts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                />
                <FilterModal
                    visible={filterOpen}
                    module="workforce"
                    onClose={() => setFilterOpen(false)}
                    onApply={setAppliedFilter}
                />


            </View>
        </View>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingTop: 4,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 14,
    },
    filterBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        height: 36,          // 🔒 fixed height
        minWidth: 170,       // 🔒 same width always
        paddingHorizontal: 12,

        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 5,
        backgroundColor: "#fff",
    },

    filterText: {
        fontSize: 14,
        marginRight: 6,
        color: "#6C3EB5",

        fontWeight: "700",
    },
    dropdown: {
        position: 'absolute',
        top: 40,
        right: 0,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        width: 160,
        zIndex: 999,
        elevation: 4,
    },

    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },


    dropdownText: {
        color: "#212121",
        fontSize: 13,
        fontWeight: "500",
    },
    fsm: {
        fontSize: 13,
        color: "#6234E2",
        fontWeight: "600",
        marginBottom: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#212121",
        marginBottom: 2,
    },
    sectionSubTitle: {
        color: "#757575",
        fontSize: 10,
        marginBottom: 14,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#D9D9D9",
        padding: 16,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
    },
    avatarSection: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        marginRight: 10,
    },
    name: {
        fontSize: 14,
        fontWeight: "600",
        color: "#212121",
    },
    viewButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#009688",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    viewText: {
        color: "#fff",
        fontSize: 9,
        fontWeight: "500",
        marginLeft: 5,
    },
    infoGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    infoBox: {
        width: "33.33%",
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRightWidth: 2,
        borderBottomWidth: 2,
        borderColor: "#D9D9D9",
    },
    labelRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    label: {
        color: "#6C35D1",
        fontSize: 12,
        fontWeight: "500",
        marginLeft: 6,
    },
    value: {
        color: "#1A1A1A",
        fontSize: 11,
        fontWeight: "600",
    },
});
