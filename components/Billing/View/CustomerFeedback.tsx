import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import Header from "../../common/Header";
import HeaderSection from "../../common/HeaderSection";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { customerFeedbackService } from "@/src/api/auth";
import FilterModal, { AppliedFilter } from "@/components/common/FilterModal";


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
const [appliedFilter, setAppliedFilter] = useState<AppliedFilter | null>(null);
  const navigation =
    useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();

  useEffect(() => {
    fetchFeedbacks();
  }, []);

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
    // navigation.navigate("CreateCustomerFeedback");
    console.log("Create new customer feedback");
  };

  const handleFeedbackCardPress = (fb: CustomerFeedback) => {
    // navigation.navigate("CustomerFeedbackDetails", { id: fb.id });
    console.log("Pressed feedback:", fb.id);
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
              <Text
                style={styles.value}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
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
  const { field, operator, value } = filter;

  const filtered = feedbacks.filter((item: any) => {
    const fieldValue = item[field];

    if (fieldValue == null) return false;

    switch (operator) {
      case 'equals':
        return String(fieldValue).toLowerCase() === value.toLowerCase();

      case 'contains':
        return String(fieldValue).toLowerCase().includes(value.toLowerCase());

      case 'greater_than':
        return Number(fieldValue) > Number(value);

      case 'less_than':
        return Number(fieldValue) < Number(value);

      default:
        return true;
    }
  });

  setFeedbacks(filtered);
};

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <Header />

      <HeaderSection
        title="What services do you need?"
        buttonText="+ New Feedback"
        onButtonClick={handleCreateNewFeedback}
       onSearchPress={() => setFilterVisible(true)}   //  ADD
      />

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.subTitle}>FSM</Text>
        <Text style={styles.title}>Customer Feedback</Text>
        <Text style={styles.subtitle}>
          {loading ? "Loading..." : "Updated just now"}
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item.id}
        renderItem={renderFeedbackCard}
        contentContainerStyle={{ padding: 12 }}
      />
      <FilterModal
  visible={filterVisible}
  module="customer_feedback"   // ✅ IMPORTANT
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
});
