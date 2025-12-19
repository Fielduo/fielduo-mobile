import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Header from "../../common/Header";
import HeaderSection from "../../common/HeaderSection";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { api } from "@/src/api/cilent";
import FilterModal, { AppliedFilter } from "@/components/common/FilterModal";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

type WorkOrder = {
  id: string;
  title?: string;
  service_type?: string;
  scheduled_at?: string;
  work_order_number?: string;
  status_name?: string;
  priority_name?: string;
};

export default function WorkOrderScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState<AppliedFilter | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'recent'>('all');
  const [recentIds, setRecentIds] = useState<string[]>([]);

  // Fetch Work Orders
  const fetchWorkOrders = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ success: boolean; work_orders: WorkOrder[] }>("/work_order");
      if (!data || !data.success) {
        setWorkOrders([]);
        return;
      }
      setWorkOrders(data.work_orders);
    } catch (err) {
      console.error("Error fetching work orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
    loadRecentIds();
  }, []);

  // Load recently viewed IDs
  const loadRecentIds = async () => {
    try {
      const stored = await AsyncStorage.getItem('recentWorkOrders');
      if (stored) setRecentIds(JSON.parse(stored));
    } catch (err) {
      console.error("Error loading recent work orders:", err);
    }
  };

  // Track recent views
  const handleCardPress = async (workorder: WorkOrder) => {
    navigation.navigate("CreateWorkorder", { mode: "view", workorder });

    try {
      let updated = recentIds.filter(id => id !== workorder.id);
      updated.unshift(workorder.id);
      updated = updated.slice(0, 10); // max 10 items
      await AsyncStorage.setItem('recentWorkOrders', JSON.stringify(updated));
      setRecentIds(updated);
    } catch (err) {
      console.error("Error saving recent work orders:", err);
    }
  };

  const handleCreateNew = () => {
    navigation.navigate("CreateWorkorder", { mode: "create" });
  };

  const renderWorkOrderCard = ({ item }: { item: WorkOrder }) => (
    <TouchableOpacity onPress={() => handleCardPress(item)}>
      <View style={styles.card}>
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

        <View style={styles.row}>
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

  const filteredWorkOrders = workOrders.filter((wo) => {
    const matchesSearch =
      (wo.work_order_number?.toLowerCase().includes(searchText.toLowerCase()) ?? false) ||
      (wo.title?.toLowerCase().includes(searchText.toLowerCase()) ?? false) ||
      (wo.service_type?.toLowerCase().includes(searchText.toLowerCase()) ?? false);

    if (!matchesSearch) return false;

    if (!appliedFilter || !appliedFilter.field) return true;

    const rawValue = wo[appliedFilter.field as keyof WorkOrder];
    if (!rawValue) return false;

    return rawValue
      .toString()
      .toLowerCase()
      .includes(appliedFilter.value.toLowerCase());
  });

  let displayedWorkOrders = [...filteredWorkOrders];

  if (viewMode === 'recent') {
    displayedWorkOrders = displayedWorkOrders.filter(wo => recentIds.includes(wo.id));
    displayedWorkOrders.sort((a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id));
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <Header />
      <HeaderSection
        title="Work Orders"
        buttonText="+ New Work Order"
        onButtonClick={handleCreateNew}
        onSearchPress={() => setFilterVisible(true)}
      />

      <View style={styles.headerRow}>
        <View style={styles.sectionHeader}>
          <Text style={styles.subTitle}>FSM</Text>
          <Text style={styles.title}>Work Orders</Text>
          <Text style={styles.subtitle}>Updated just now</Text>
        </View>

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

      {loading ? (
        <ActivityIndicator size="large" color="#6234E2" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={displayedWorkOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderWorkOrderCard}
          contentContainerStyle={{ padding: 12 }}
        />
      )}

      <FilterModal
        visible={filterVisible}
        module="work_orders"
        onClose={() => setFilterVisible(false)}
        onApply={(filter) => {
          setAppliedFilter(filter);
          setFilterVisible(false);
        }}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#FFF',
  },



  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    height: 36,
    minWidth: 170,
    paddingHorizontal: 12,

    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    backgroundColor: '#fff',
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
});
