import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import Header from "../../common/Header";
import HeaderSection from "../../common/HeaderSection";
import { Ionicons } from "@expo/vector-icons";


const accounts = [
    {
        name: "lakshmims",
        status: "Active",
        type: "Partner",
        industry: "IT",
        credit: "₹899.97",
        revenue: "₹50,000",
        rating: "Hot",
        color: "#00897B", // teal
    },
    {
        name: "lakshmipriya srinivasan",
        status: "Pending",
        type: "Customer",
        industry: "IT",
        credit: "₹120,000",
        revenue: "₹900,390",
        rating: "Excellent",
        color: "#FBC02D", // yellow
    },
];

export default function AccountsScreen() {
    return (
        <View style={{ flex: 1, backgroundColor: "#FFF" }}>
            <Header />
            <HeaderSection
                title="What services do you need?"
                buttonText="+ New Contacts"
            //             onButtonClick={() =>
            //   navigation.navigate("ContactForm", {
            //     mode: "create",
            //   })
            // }

            />
            <ScrollView style={styles.container}>

                {/* Header */}
                <View style={styles.pageHeader}>
                    <View>
                        <Text style={styles.crmText}>CRM</Text>
                        <Text style={styles.pageTitle}>Accounts</Text>
                        <Text style={styles.subTitle}>5 items - Updated just now</Text>
                    </View>

                    <TouchableOpacity style={styles.filterBtn}>
                        <Text style={styles.filterText}>Recently Viewed</Text>
                        <Ionicons name="chevron-down-outline" size={16} color="#444" />
                    </TouchableOpacity>
                </View>

                {/* Cards */}
                {accounts.map((acc, i) => (
                    <View key={i} style={[styles.card, { borderLeftColor: acc.color }]}>

                        {/* Row 1 */}
                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Text style={styles.label}>Account Name</Text>
                                <Text style={styles.value}>{acc.name}</Text>
                            </View>

                            <View style={styles.col}>
                                <Text style={styles.label}>Status</Text>
                                <View style={[styles.statusBadge, getStatusStyle(acc.status)]}>
                                    <Text style={[styles.statusText, getStatusTextStyle(acc.status)]}>
                                        {acc.status}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.col}>
                                <Text style={styles.label}>Type</Text>
                                <Text style={styles.value}>{acc.type}</Text>
                            </View>

                            <View style={styles.col}>
                                <Text style={styles.label}>Industry</Text>
                                <Text style={styles.value}>{acc.industry}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Row 2 */}
                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Text style={styles.label}>Credit Limit</Text>
                                <Text style={styles.value}>{acc.credit}</Text>
                            </View>

                            <View style={styles.col}>
                                <Text style={styles.label}>Total Revenue</Text>
                                <Text style={styles.value}>{acc.revenue}</Text>
                            </View>

                            <View style={styles.col}>
                                <Text style={styles.label}>Customer Rating</Text>
                                <Text style={styles.value}>{acc.rating}</Text>
                            </View>
                        </View>

                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const getStatusStyle = (status: string) => {
    switch (status) {
        case "Active":
            return { backgroundColor: "#E0F2F1", borderColor: "#00897B" };
        case "Pending":
            return { backgroundColor: "#FFF8E1", borderColor: "#FBC02D" };
        default:
            return {};
    }
};

const getStatusTextStyle = (status: string) => {
    switch (status) {
        case "Active":
            return { color: "#00897B" };
        case "Pending":
            return { color: "#FBC02D" };
        default:
            return {};
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingTop: 8,
    },

    pageHeader: {
        marginBottom: 20,
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

    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        borderLeftWidth: 8,
        borderWidth: 1,
        borderColor: "#53535180"
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },

    col: {
        flex: 1,
        paddingRight: 10,
    },

    label: {
        fontSize: 10,
        color: "#777",
    },

    value: {
        fontSize: 12,
        fontWeight: "600",
        marginTop: 3,
        textTransform: "capitalize",
    },

    divider: {
        height: 2,
        backgroundColor: "#D9D9D9e",
        marginVertical: 10,
    },

    statusBadge: {
        borderWidth: 1,
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 20,
        alignSelf: "flex-start",
        marginTop: 4,
    },

    statusText: {
        fontWeight: "700",
        fontSize: 12,
    },
});
