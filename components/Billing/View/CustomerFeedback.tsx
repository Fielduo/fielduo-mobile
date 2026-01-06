import FilterModal, { AppliedFilter } from "@/components/common/FilterModal";
import { customerFeedbackService } from "@/src/api/auth";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { Ionicons } from "@expo/vector-icons";
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
export interface CustomerFeedback {
  id: string;
  organization_name: string;
  work_order_number: string;
  rating: number;
  comments?: string;
  submitted_at?: string;
  created_by_name: string;
  updated_at?: string;
  updated_by_name?: string;
}

// --- Main Component ---
const CustomerFeedback: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState<AppliedFilter | null>(
    null
  );
  const navigation =
    useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  type ViewMode = "all" | "recent";

  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [recentViewedIds, setRecentViewedIds] = useState<string[]>([]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await customerFeedbackService.getAll();
      setFeedbacks(data);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      Alert.alert("Error", "Failed to load customer feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewFeedback = () => {
    navigation.navigate("CreateCustomerFeedback", {
      mode: "create",
    });
  };

  const handleFeedbackCardPress = (fb: CustomerFeedback) => {
    setRecentViewedIds((prev) =>
      prev.includes(fb.id) ? prev : [fb.id, ...prev].slice(0, 10)
    );

    navigation.navigate("CreateCustomerFeedback", {
      mode: "view",
      feedback: fb,
    });
  };

  // ⭐ helper: show rating as stars
  const renderStars = (rating: number) => {
    const max = 5;
    const filled = "★".repeat(Math.max(0, Math.min(rating, max)));
    const empty = "☆".repeat(max - Math.max(0, Math.min(rating, max)));
    return (
      <Text style={styles.ratingText}>
        {filled}
        {empty}
      </Text>
    );
  };

  const renderFeedbackCard = ({ item }: { item: CustomerFeedback }) => {
    return (
      <TouchableOpacity onPress={() => handleFeedbackCardPress(item)}>
        <View style={styles.card}>
          {/* Row 1: Organization | Work Order | Rating */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Organization</Text>
              <Text style={styles.value}>{item.organization_name}</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.col}>
              <Text style={styles.label}>Work Order</Text>
              <Text style={styles.value}>{item.work_order_number}</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.col}>
              <Text style={styles.label}>Rating</Text>
              {renderStars(item.rating)}
            </View>
          </View>

          {/* Row 2: Comments | Submitted At | Created By */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Comments</Text>
              <Text style={styles.value} numberOfLines={2} ellipsizeMode="tail">
                {item.comments || "-"}
              </Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.col}>
              <Text style={styles.label}>Submitted At</Text>
              <Text style={styles.value}>
                {item.submitted_at
                  ? new Date(item.submitted_at).toLocaleDateString("en-IN")
                  : "-"}
              </Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.col}>
              <Text style={styles.label}>Created By</Text>
              <Text style={styles.value}>{item.created_by_name}</Text>
            </View>
          </View>

          {/* Row 3: Updated At | Updated By */}
          <View style={styles.row}>
            {/* UPDATED AT */}
            <View style={styles.col}>
              <Text style={styles.label}>Updated At</Text>
              <Text style={styles.value}>
                {item.updated_at
                  ? new Date(item.updated_at).toLocaleDateString("en-IN")
                  : "-"}
              </Text>
            </View>

            <View style={styles.verticalDivider} />

            {/* UPDATED BY */}
            <View style={styles.col}>
              <Text style={styles.label}>Updated By</Text>
              <Text style={styles.value}>{item.updated_by_name || "-"}</Text>
            </View>

            {/* EMPTY COL TO MATCH 3-COLUMN LAYOUT */}
            <View style={styles.col}>
              {/* keep it empty so spacing matches other rows */}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const applyLocalFilter = (filter: AppliedFilter) => {
    setAppliedFilter(filter);
  };

  const filteredFeedbacks = useMemo(() => {
    let data = feedbacks;

    if (viewMode === "recent") {
      data = data.filter((fb) => recentViewedIds.includes(fb.id));
    }

    if (!appliedFilter) return data;

    const { field, operator, value } = appliedFilter;

    return data.filter((fb: any) => {
      const fieldValue = fb[field];
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
  }, [feedbacks, appliedFilter, viewMode, recentViewedIds]);

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <Header />

      <HeaderSection
        title="What services do you need?"
        buttonText="+ New Feedback"
        onButtonClick={handleCreateNewFeedback}
        onSearchPress={() => setFilterVisible(true)} //  ADD
      />

      {/* Section Header */}
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.subTitle}>FSM</Text>
            <Text style={styles.title}>Customer Feedback</Text>
            <Text style={styles.subtitle}>
              {loading
                ? "Loading..."
                : `${filteredFeedbacks.length} items - Updated just now`}
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

      {/* Cards */}

      {/* List */}
      <FlatList
        data={filteredFeedbacks}
        keyExtractor={(item) => item.id}
        renderItem={renderFeedbackCard}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      />
      <FilterModal
        visible={filterVisible}
        module="customer_feedback" // ✅ IMPORTANT
        onClose={() => setFilterVisible(false)}
        onApply={(filter) => {
          setAppliedFilter(filter);
          applyLocalFilter(filter);
        }}
      />
    </View>
  );
};

export default CustomerFeedback;

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
  card: {
    width: "100%", // 🔥 IMPORTANT
    borderWidth: 1,
    borderColor: "#53535180",
    borderRadius: 12,
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
  ratingText: {
    fontSize: 14,
    color: "#F59E0B", // star-ish color
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
});
