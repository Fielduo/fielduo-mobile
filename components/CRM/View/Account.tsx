import FilterModal, { AppliedFilter } from "@/components/common/FilterModal";
import Header from "@/components/common/Header";
import HeaderSection from "@/components/common/HeaderSection";
import { Account, accountsService } from "@/src/api/auth";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AccountsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState<AppliedFilter | null>(
    null
  );

  type ViewMode = "all" | "recent";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [recentViewedIds, setRecentViewedIds] = useState<string[]>([]);

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

  const filteredAccounts = useMemo(() => {
    let data = accounts;

    if (viewMode === "recent") {
      data = data.filter((acc) => recentViewedIds.includes(acc.id));
    }

    if (!appliedFilter) return data;

    const { field, operator, value } = appliedFilter;

    return data.filter((acc: any) => {
      const fieldValue = acc[field];
      if (fieldValue == null) return false;

      switch (operator) {
        case "contains":
          return String(fieldValue).toLowerCase().includes(value.toLowerCase());
        case "equals":
          return String(fieldValue).toLowerCase() === value.toLowerCase();
        case "starts_with":
          return String(fieldValue)
            .toLowerCase()
            .startsWith(value.toLowerCase());
        case "greater_than":
          return Number(fieldValue) > Number(value);
        case "less_than":
          return Number(fieldValue) < Number(value);
        default:
          return true;
      }
    });
  }, [accounts, appliedFilter, viewMode, recentViewedIds]);

  // ✅ Create New Account (FIXED)
  const handleCreateNewAccount = () => {
    navigation.navigate("CreateAccount", {
      mode: "create",
    });
  };

  // ✅ Open Account
  const handleAccountPress = (account: Account) => {
    setRecentViewedIds((prev) =>
      prev.includes(account.id) ? prev : [account.id, ...prev].slice(0, 10)
    );

    navigation.navigate("CreateAccount", {
      mode: "view",
      account,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <Header />
      <HeaderSection
        title="What services do you need?"
        buttonText="+ New Accounts"
        onButtonClick={handleCreateNewAccount}
        onSearchPress={() => setFilterVisible(true)}
      />

      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.crmText}>CRM</Text>
            <Text style={styles.pageTitle}>Accounts</Text>
            <Text style={styles.subTitle}>
              {accounts.length} items - Updated just now
            </Text>
          </View>

          <View style={{ position: "relative" }}>
            <TouchableOpacity
              style={styles.filterBtn}
              onPress={() => setDropdownOpen((p) => !p)}
            >
              <Text style={styles.filterText}>
                {viewMode === "all" ? "All" : "Recently Viewed"}
              </Text>
              <Ionicons name="chevron-down-outline" size={16} color="#444" />
            </TouchableOpacity>

            {dropdownOpen && (
              <View style={styles.dropdown}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setViewMode("all");
                    setDropdownOpen(false);
                  }}
                >
                  <Text>All</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setViewMode("recent");
                    setDropdownOpen(false);
                  }}
                >
                  <Text>Recently Viewed</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Cards */}
        {loading ? (
          <ActivityIndicator size="large" color="#6234E2" />
        ) : (
          filteredAccounts.map((acc) => (
            <TouchableOpacity
              key={acc.id}
              activeOpacity={0.85}
              onPress={() => handleAccountPress(acc)}
            >
              <View style={[styles.card, { borderLeftColor: "#6234E2" }]}>
                <View style={styles.row}>
                  <View style={styles.col}>
                    <Text style={styles.label}>Account Name</Text>
                    <Text style={styles.value}>{acc.name}</Text>
                  </View>

                  <View style={styles.col}>
                    <Text style={styles.label}>Status</Text>
                    <View
                      style={[styles.statusBadge, getStatusStyle(acc.status)]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          getStatusTextStyle(acc.status),
                        ]}
                      >
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
                    <Text style={styles.value}>
                      {acc.customer_rating || "-"}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
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

/* ---------------- helpers & styles (unchanged) ---------------- */

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
    justifyContent: "space-between",
    height: 36,
    minWidth: 170,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  filterText: {
    fontSize: 14,
    marginRight: 6,
    color: "#6C3EB5",
    fontWeight: "700",
  },
  dropdown: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    width: 160,
    zIndex: 999,
    elevation: 4,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
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
    borderColor: "#53535180",
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
