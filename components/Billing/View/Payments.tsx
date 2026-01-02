import FilterModal, { AppliedFilter } from "@/components/common/FilterModal";
import { paymentService } from "@/src/api/auth";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../../common/Header";
import HeaderSection from "../../common/HeaderSection";

// --- Types ---
export interface Payment {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  customer_name: string;
  method: string;
  notes?: string;
  payment_date?: string;
  reference?: string;
  created_at?: string;
}

// --- Main Component ---
const Payments: React.FC = () => {
  type ViewMode = "all" | "recent";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [recentViewedIds, setRecentViewedIds] = useState<string[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState<AppliedFilter | null>(
    null
  );

  const navigation =
    useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getAll(); // adjust API call
      setPayments(data);
    } catch (err) {
      console.error("Payments fetch error:", err);
      Alert.alert("Error", "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleCreateNewPayment = () => {
    navigation.navigate("CreatePayment", {
      mode: "create",
    });
    console.log("Create new payment");
  };

  const handlePaymentCardPress = (payment: Payment) => {
    // Mark this payment as recently viewed (move to front, keep max 10)
    setRecentViewedIds((prev) => {
      const filtered = prev.filter((id) => id !== payment.id);
      return [payment.id, ...filtered].slice(0, 10);
    });

    navigation.navigate("CreatePayment", {
      mode: "view",
      payment,
    });
    console.log("Pressed payment:", payment.id);
  };

  // Load recently viewed ids from storage on mount
  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem("payments_recent_viewed");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setRecentViewedIds(parsed);
        }
      } catch (err) {
        console.error("Failed to load recent payments:", err);
      }
    };
    load();
  }, []);

  // Persist recently viewed ids whenever they change
  useEffect(() => {
    const save = async () => {
      try {
        await AsyncStorage.setItem(
          "payments_recent_viewed",
          JSON.stringify(recentViewedIds)
        );
      } catch (err) {
        console.error("Failed to save recent payments:", err);
      }
    };
    save();
  }, [recentViewedIds]);

  const renderPaymentCard = ({ item }: { item: Payment }) => {
    return (
      <TouchableOpacity onPress={() => handlePaymentCardPress(item)}>
        <View style={styles.card}>
          {/* Row 1: Invoice | Amount | Status */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Invoice</Text>
              <Text style={styles.value}>{item.invoice_number}</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.col}>
              <Text style={styles.label}>Amount</Text>
              <Text style={styles.value}>{item.amount}</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.col}>
              <Text style={styles.label}>Status</Text>
              <View
                style={[
                  styles.badge,
                  item.status === "Paid"
                    ? styles.completed
                    : item.status === "Pending"
                    ? styles.inProgress
                    : styles.pending,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    item.status === "Paid"
                      ? styles.completedText
                      : item.status === "Pending"
                      ? styles.inProgressText
                      : styles.pendingText,
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
          </View>

          {/* Row 2: Customer | Method | Notes */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Customer</Text>
              <Text style={styles.value}>{item.customer_name}</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.col}>
              <Text style={styles.label}>Method</Text>
              <Text style={styles.value}>{item.method}</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.col}>
              <Text style={styles.label}>Notes</Text>
              <Text style={styles.value} numberOfLines={2} ellipsizeMode="tail">
                {item.notes || "-"}
              </Text>
            </View>
          </View>

          {/* Row 3: Payment Date | Reference | Created At */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Payment Date</Text>
              <Text style={styles.value}>
                {item.payment_date
                  ? new Date(item.payment_date).toLocaleDateString("en-IN")
                  : "-"}
              </Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.col}>
              <Text style={styles.label}>Reference</Text>
              <Text style={styles.value}>{item.reference || "-"}</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.col}>
              <Text style={styles.label}>Created At</Text>
              <Text style={styles.value}>
                {item.created_at
                  ? new Date(item.created_at).toLocaleDateString("en-IN")
                  : "-"}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredPayments = useMemo(() => {
    let data = payments;

    if (viewMode === "recent") {
      // Only include payments that are in recentViewedIds and
      // preserve the order from recentViewedIds (most recent first).
      data = recentViewedIds
        .map((id) => payments.find((p) => p.id === id))
        .filter((p): p is Payment => Boolean(p));
    }
    if (!appliedFilter) return data;

    const { field, operator, value } = appliedFilter;

    return data.filter((p: any) => {
      const fieldValue = p[field];
      if (fieldValue == null) return false;

      switch (operator) {
        case "equals":
          return String(fieldValue).toLowerCase() === value.toLowerCase();

        case "contains":
          return String(fieldValue).toLowerCase().includes(value.toLowerCase());

        case "greater_than":
          return Number(fieldValue) > Number(value);

        case "less_than":
          return Number(fieldValue) < Number(value);

        default:
          return true;
      }
    });
  }, [payments, appliedFilter, viewMode, recentViewedIds]);

  const applyLocalFilter = (filter: AppliedFilter) => {
    setAppliedFilter(filter);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <Header />

      <HeaderSection
        title="What services do you need?"
        buttonText="+ New Payment"
        onButtonClick={handleCreateNewPayment}
        onSearchPress={() => setFilterVisible(true)} //  ADD
      />

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.subTitle}>FSM</Text>
            <Text style={styles.title}>Payments</Text>
            <Text style={styles.subtitle}>
              {loading
                ? "Loading..."
                : `${
                    viewMode === "recent"
                      ? filteredPayments.length
                      : payments.length
                  } items - Updated just now`}
            </Text>
          </View>

          {/* Dropdown button */}
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
      </View>

      {/* List */}
      <FlatList
        data={filteredPayments}
        keyExtractor={(item) => item.id}
        renderItem={renderPaymentCard}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
      />
      <FilterModal
        visible={filterVisible}
        module="payments" // ✅ IMPORTANT
        onClose={() => setFilterVisible(false)}
        onApply={(filter) => {
          setAppliedFilter(filter);
          applyLocalFilter(filter);
        }}
      />
    </View>
  );
};

export default Payments;

// --- Styles: same as Quotes / Feedback with divider ---
const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "#FFF",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  subTitle: {
    color: "#6234E2",
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#101318",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 10,
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
    borderWidth: 1,
    borderColor: "#C4B5FD",
    borderRadius: 10,
    padding: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 8,
  },
  col: {
    flex: 1,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: "#D9D9D9",
    marginHorizontal: 8,
  },
  label: {
    color: "#6234E2",
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 4,
  },
  value: {
    color: "#374151",
    fontSize: 13,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  completed: { backgroundColor: "#d8fff2" },
  completedText: { color: "#00a676" },
  inProgress: { backgroundColor: "#fff6db" },
  inProgressText: { color: "#b58b00" },
  pending: { backgroundColor: "#ffe5e5" },
  pendingText: { color: "#d22f2f" },
  high: { backgroundColor: "#ffe5e5" },
  highText: { color: "#d22f2f" },
  medium: { backgroundColor: "#fff6db" },
  mediumText: { color: "#b58b00" },
  low: { backgroundColor: "#d8fff2" },
  lowText: { color: "#00a676" },
});
