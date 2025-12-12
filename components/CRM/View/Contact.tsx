import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from "react-native";

import Header from "../../common/Header";
import HeaderSection from "../../common/HeaderSection";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { api } from "@/src/api/cilent";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";


type ContactNavigationProp = NativeStackNavigationProp<
    SearchMenuStackParamList,
    'Contact'
>;
interface ContactItem {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    avatar?: string;
    account_name?: string;
    type?: string;
    city?: string;
    street?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    preferred_contact_method?: string;
    last_service_date?: string;
    special_instructions?: string;
}


const Contact = () => {
    const [contacts, setContacts] = useState<ContactItem[]>([]);
    const navigation = useNavigation<ContactNavigationProp>();
    const baseURL = api.getBaseUrl();

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const res = await api.get<ContactItem[]>("/contacts");
            setContacts(res);
        } catch (err) {
            console.log("Error loading contacts:", err);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleString("en-US", {
            // Oct
            day: "2-digit",    // 18
            month: "short",
            year: "numeric",   // 2025

        });
    };
    return (
        <View style={{ flex: 1, backgroundColor: "#FFF" }}>
            <Header />
            <HeaderSection
                title="What services do you need?"
                buttonText="+ New Contacts"
                onButtonClick={() =>
                    navigation.navigate("ContactForm", {
                        mode: "create",
                    })
                }

            />
            <ScrollView style={styles.container}>
                <View style={styles.pageHeader}>
                    <View>
                        <Text style={styles.crmText}>CRM</Text>
                        <Text style={styles.pageTitle}>Contacts</Text>
                        <Text style={styles.subTitle}>
                            {contacts.length} items - Updated just now
                        </Text>

                    </View>

                    <TouchableOpacity style={styles.filterBtn}>
                        <Text style={styles.filterText}>Recently Viewed</Text>
                        <Ionicons name="chevron-down-outline" size={16} color="#444" />
                    </TouchableOpacity>
                </View>

                {/* ---------- SCROLL LIST ---------- */}

                {contacts.map((item, index) => (
                    <View key={index} style={styles.card}>
                        <View style={styles.topRow}>

                            <Image
                                source={{
                                    uri: item.avatar
                                        ? `${baseURL}${item.avatar}`
                                        : "https://i.pravatar.cc/150",
                                }}
                                style={styles.avatar}
                            />

                            <Text style={styles.name}>
                                {item.first_name} {item.last_name}
                            </Text>

                            <TouchableOpacity style={styles.viewBtn}>
                                <Ionicons name="eye" size={18} color="#fff" />
                                <Text onPress={() =>
                                    navigation.navigate("ContactForm", {
                                        mode: "view",
                                        data: item
                                    })
                                } style={styles.viewText}>View</Text>
                            </TouchableOpacity>
                        </View>

                        {/* ---- CONTACT INFO GRID ---- */}
                        <View style={{ marginTop: 16 }}>

                            {/* ROW 1 */}
                            <View style={styles.infoGrid}>
                                <View style={styles.infoBox}>
                                    <View style={styles.labelRow}>
                                        <Ionicons name="mail-outline" size={16} color="#6C35D1" />
                                        <Text style={styles.label}>Email</Text>
                                    </View>
                                    <Text style={styles.value}>{item.email || "—"}</Text>
                                </View>

                                <View style={styles.infoBox}>
                                    <View style={styles.labelRow}>
                                        <Ionicons name="call-outline" size={16} color="#6C35D1" />
                                        <Text style={styles.label}>Phone</Text>
                                    </View>
                                    <Text style={styles.value}>{item.phone || "—"}</Text>
                                </View>

                                <View style={[styles.infoBox, { borderRightWidth: 0 }]}>
                                    <View style={styles.labelRow}>
                                        <Ionicons name="person-outline" size={16} color="#6C35D1" />
                                        <Text style={styles.label}>Account</Text>
                                    </View>
                                    <Text style={styles.value}>{item.account_name || "—"}</Text>
                                </View>
                            </View>

                            {/* ROW 2 */}
                            <View style={styles.infoGrid}>
                                <View style={[styles.infoBox, { borderBottomWidth: 0 }]}>
                                    <View style={styles.labelRow}>
                                        <Ionicons name="location-outline" size={16} color="#6C35D1" />
                                        <Text style={styles.label}>Type</Text>
                                    </View>
                                    <Text style={styles.value}>{item.type || "Primary"}</Text>
                                </View>

                                <View style={[styles.infoBox, { borderBottomWidth: 0 }]}>
                                    <View style={styles.labelRow}>
                                        <MaterialCommunityIcons name="city" size={16} color="#6C35D1" />
                                        <Text style={styles.label}>City</Text>
                                    </View>
                                    <Text style={styles.value}>{item.city || "—"}</Text>
                                </View>

                                <View style={[styles.infoBox, { borderBottomWidth: 0, borderRightWidth: 0 }]}>
                                    <View style={styles.labelRow}>
                                        <Ionicons name="calendar-outline" size={16} color="#6C35D1" />
                                        <Text style={styles.label}>Last Service</Text>
                                    </View>
                                    <Text style={styles.value}>
                                        {formatDate(item.last_service_date) || "—"}
                                    </Text>

                                </View>

                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingTop: 4,
    },
    pageHeader: {

        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    crmText: {
        color: "#6C3EB5",
        fontSize: 10,
        fontWeight: "600",
    },

    pageTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111",
        marginTop: 3,
    },

    subTitle: {
        fontSize: 10,
        color: "#6B7280",
        marginTop: 2,
    },

    filterBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
    },

    filterText: {
        fontSize: 14,
        marginRight: 6,
        color: "#6C3EB5",

        fontWeight: "700",
    },

    /* ----------- CARD ----------- */

    card: {
        backgroundColor: "#fff",
        padding: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",

        marginTop: 16,
    },

    topRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    avatar: {
        width: 55,
        height: 55,
        borderRadius: 50,
        marginRight: 12,
    },

    name: {
        flex: 1,
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
    },

    viewBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#009587",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 5,
    },

    viewText: {
        color: "#fff",
        marginLeft: 6,
        fontWeight: "600",
    },


    infoGrid: {
        flexDirection: "row",
        flexWrap: "wrap",

    },
    infoBox: {
        width: "33.33%",
        paddingHorizontal: 6,
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
        fontSize: 10,
        fontWeight: "600",
    },


});

export default Contact;
