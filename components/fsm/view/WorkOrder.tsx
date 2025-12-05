import React, { useState, useEffect } from "react";
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
import { SearchMenuStackParamList } from "../../../navigation/StackNavigator.tsx/SearchmenuNavigator";
import { api } from "../../../api/client";


interface DropdownOption {
  id: string;   // UUID from backend
  name: string; // display name
}


export default function WorkOrder() {
  const navigation =
    useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();

const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
const [loading, setLoading] = useState(false);
const [statuses, setStatuses] = useState<DropdownOption[]>([]);
const [priorities, setPriorities] = useState<DropdownOption[]>([]);
const [types, setTypes] = useState<DropdownOption[]>([]);




// 🔥 Fetch Work Orders
const fetchWorkOrders = async () => {
  setLoading(true);
  try {
    const data = await api.get<{ success: boolean; work_orders: WorkOrder[] }>(
      "/work_order"
    );

    if (!data || !data.success) {
      setWorkOrders([]);
      return;
    }

    console.log("Fetched work orders:", data.work_orders);
    setWorkOrders(data.work_orders);
  } catch (err) {
    console.error("Error fetching work orders:", err);
  } finally {
    setLoading(false);
  }
};

// ✅ FIX: call fetchWorkOrders here
useEffect(() => {
  fetchWorkOrders();
}, []);




  
 

  const handleCardPress = (workorder: WorkOrder) => {
    navigation.navigate("CreateWorkorder", { mode: "view", workorder });
  };

  const handleCreateNew = () => {
    navigation.navigate("CreateWorkorder", { mode: "create" });
  };

  // 🔹 Render card
      // 🔥 Render Card (fixed return)
  const renderWorkOrderCard = ({ item }: { item: WorkOrder }) => {
    return (
      <TouchableOpacity onPress={() => handleCardPress(item)}>
        <View style={styles.card}>
          {/* Row 1 */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Work Order</Text>
              <Text style={styles.value}>{item.work_order_number}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Title</Text>
              <Text style={styles.value}>{item.title}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Type</Text>
              <Text style={styles.value}>{item.service_type}</Text>
            </View>
          </View>

          {/* Row 2 */}
          <View style={styles.row}>
            {/* STATUS */}
            <View style={styles.col}>
              <Text style={styles.label}>Status</Text>
              <View
                style={[
                  styles.badge,
                  item.status_name === "Completed"
                    ? styles.completed
                    : item.status_name === "In Progress"
                    ? styles.inProgress
                    : styles.pending,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    item.status_name === "Completed"
                      ? styles.completedText
                      : item.status_name === "In Progress"
                      ? styles.inProgressText
                      : styles.pendingText,
                  ]}
                >
                  {item.status_name}
                </Text>
              </View>
            </View>

            {/* PRIORITY */}
            <View style={styles.col}>
              <Text style={styles.label}>Priority</Text>
              <View
                style={[
                  styles.badge,
                  item.priority_name === "High"
                    ? styles.high
                    : item.priority_name === "Medium"
                    ? styles.medium
                    : styles.low,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    item.priority_name === "High"
                      ? styles.highText
                      : item.priority_name === "Medium"
                      ? styles.mediumText
                      : styles.lowText,
                  ]}
                >
                  {item.priority_name}
                </Text>
              </View>
            </View>

            {/* SCHEDULE */}
            <View style={styles.col}>
              <Text style={styles.label}>Schedule</Text>
              <Text style={styles.value}>
  {item.scheduled_at
    ? new Date(item.scheduled_at).toLocaleDateString("en-IN")
    : ""}
</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <Header />

      <HeaderSection
        title="Work Orders"
        buttonText="+ New Work Order"
        onButtonClick={handleCreateNew}
        onSearchChange={(text) => console.log("Searching:", text)}
      />

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.subTitle}>FSM</Text>
        <Text style={styles.title}>Work Orders</Text>
        <Text style={styles.subtitle}>Updated just now</Text>
      </View>

      {/* List */}
      <FlatList
        data={workOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderWorkOrderCard}
        contentContainerStyle={{ padding: 12 }}
      />
    </View>
  );
}


 
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
    justifyContent: "space-between",
    marginBottom: 8,
  },
  col: {
    flex: 1,
    marginRight: 8,
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
  // Status colors
  completed: { backgroundColor: "#d8fff2" },
  completedText: { color: "#00a676" },
  inProgress: { backgroundColor: "#fff6db" },
  inProgressText: { color: "#b58b00" },
  pending: { backgroundColor: "#ffe5e5" },
  pendingText: { color: "#d22f2f" },
  // Priority colors
  high: { backgroundColor: "#ffe5e5" },
  highText: { color: "#d22f2f" },
  medium: { backgroundColor: "#fff6db" },
  mediumText: { color: "#b58b00" },
  low: { backgroundColor: "#d8fff2" },
  lowText: { color: "#00a676" },
});
