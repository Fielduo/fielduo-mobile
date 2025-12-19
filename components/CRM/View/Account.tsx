import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import Header from "../../common/Header";
import HeaderSection from "../../common/HeaderSection";
import { Ionicons } from "@expo/vector-icons";
import { Account, accountsService } from "@/src/api/auth";
import FilterModal, { AppliedFilter } from "@/components/common/FilterModal";




export default function AccountsScreen() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterVisible, setFilterVisible] = useState(false);
    const [appliedFilter, setAppliedFilter] = useState<AppliedFilter | null>(null);


    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const data = await accountsService.getAll();
            setAccounts(data);
        } catch (err) {
            console.error("Accounts fetch error:", err);
            Alert.alert("Error", "Failed to load accounts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);
    const handleApplyFilter = (filter: AppliedFilter) => {
        setAppliedFilter(filter);
    };

    const filteredAccounts = React.useMemo(() => {
        if (!appliedFilter) return accounts;

        const { field, operator, value } = appliedFilter;

        return accounts.filter((acc: any) => {
            const fieldValue = acc[field];

            if (fieldValue == null) return false;

            switch (operator) {
                case 'contains':
                    return String(fieldValue).toLowerCase().includes(value.toLowerCase());

                case 'equals':
                    return String(fieldValue).toLowerCase() === value.toLowerCase();

                case 'starts_with':
                    return String(fieldValue).toLowerCase().startsWith(value.toLowerCase());

                case 'greater_than':
                    return Number(fieldValue) > Number(value);

                case 'less_than':
                    return Number(fieldValue) < Number(value);

                default:
                    return true;
            }
        });
    }, [accounts, appliedFilter]);

    return (
        <View style={{ flex: 1, backgroundColor: "#FFF" }}>
            <Header />
            <HeaderSection
                title="What services do you need?"
                buttonText="+ New Accounts"
                //             onButtonClick={() =>
                //   navigation.navigate("ContactForm", {
                //     mode: "create",
                //   })
                // }
                onSearchPress={() => setFilterVisible(true)} //  Open filter modal
            />
            <ScrollView style={styles.container}>

                {/* Header */}
                <View style={styles.pageHeader}>
                    <View>
                        <Text style={styles.crmText}>CRM</Text>
                        <Text style={styles.pageTitle}>Accounts</Text>
                        <Text style={styles.subTitle}> Updated just now</Text>
                    </View>

                    <TouchableOpacity style={styles.filterBtn}>
                        <Text style={styles.filterText}>Recently Viewed</Text>
                        <Ionicons name="chevron-down-outline" size={16} color="#444" />
                    </TouchableOpacity>
                </View>

                {/* Cards */}
                {loading ? (
                    <ActivityIndicator size="large" color="#6234E2" />
                ) : (
                    filteredAccounts.map((acc, i) => (
                        <View key={acc.id} style={[styles.card, { borderLeftColor: "#6234E2" }]}>

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
                                    <Text style={styles.value}>{acc.type || "-"}</Text>
                                </View>

                                <View style={styles.col}>
                                    <Text style={styles.label}>Industry</Text>
                                    <Text style={styles.value}>{acc.industry || "-"}</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            {/* Row 2 */}
                            <View style={styles.row}>
                                <View style={styles.col}>
                                    <Text style={styles.label}>Credit Limit</Text>
                                    <Text style={styles.value}>
                                        {acc.credit_limit ? `₹${acc.credit_limit}` : "-"}
                                    </Text>
                                </View>

                                <View style={styles.col}>
                                    <Text style={styles.label}>Total Revenue</Text>
                                    <Text style={styles.value}>
                                        {acc.total_revenue ? `₹${acc.total_revenue}` : "-"}
                                    </Text>
                                </View>

                                <View style={styles.col}>
                                    <Text style={styles.label}>Customer Rating</Text>
                                    <Text style={styles.value}>{acc.customer_rating || "-"}</Text>
                                </View>
                            </View>

                        </View>
                    ))
                )}
<FilterModal
  visible={filterVisible}
  module="accounts"
  onClose={() => setFilterVisible(false)}
  onApply={handleApplyFilter}
/>

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
        fontSize: 11,
        color: "#777",
    },

    value: {
        fontSize: 10,
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
