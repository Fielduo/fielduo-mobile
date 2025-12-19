import React, { useEffect, useState } from "react";
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
import { Inventory } from "@/types/Worker";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { api } from "@/src/api/cilent";
import { Ionicons } from "@expo/vector-icons";
import FilterModal, { AppliedFilter } from "@/components/common/FilterModal";

export default function InventoryScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();

  const [inventoryData, setInventoryData] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  type ViewMode = 'all' | 'recent';

  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [recentInventory, setRecentInventory] = useState<Inventory[]>([]);

  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('all');

  // 🔹 Fetch inventory list from API
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);


      const data = await api.get<Inventory[]>("/inventory");

      setInventoryData(data || []);
    } catch (err: any) {
      console.error("Error fetching inventory:", err);
      setError(err?.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // 🔹 Navigate to view/edit inventory
  const handleCardPress = (inventory: Inventory) => {
    setRecentInventory((prev) => {
      const exists = prev.find((i) => i.item_id === inventory.item_id);
      if (exists) return prev;

      // latest first, max 5 items
      return [inventory, ...prev].slice(0, 5);
    });

    navigation.navigate("CreateInventory", { mode: "view", inventory });
  };


  // 🔹 Navigate to create new inventory
  const handleCreateNew = () => {
    navigation.navigate("CreateInventory", { mode: "create" });
  };

  const getStockLabel = (qty: number | null) => {
    if (qty === null || qty === undefined) return "N/A";
    if (qty === 0) return "Out of Stock";
    if (qty < 10) return "Low Stock";
    return "In Stock";
  };

  const isLowStock = (qty: number | null) =>
    qty !== null && qty !== undefined && qty > 0 && qty < 10;

  const renderInventoryCard = ({ item }: { item: Inventory }) => {
    return (
      <TouchableOpacity onPress={() => handleCardPress(item)}>
        <View style={styles.card}>
          {/* Row 1 */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Item Number</Text>
              <Text style={styles.value}>{item.item_number ?? item.item_id}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Item Name</Text>
              <Text style={styles.value}>{item.item_name}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.value}>
                {item.item_description || "-"}
              </Text>
            </View>
          </View>

          {/* Row 2 */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Category</Text>
              <Text style={styles.value}>{item.category || "-"}</Text>
            </View>

            {/* Stock Quantity Badge */}
            <View style={styles.col}>
              <Text style={styles.label}>Stock Quantity</Text>
              <View
                style={[
                  styles.badge,
                  isLowStock(item.stock_quantity)
                    ? styles.lowStock
                    : styles.inStock,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    isLowStock(item.stock_quantity)
                      ? styles.lowStockText
                      : styles.inStockText,
                  ]}
                >
                  {getStockLabel(item.stock_quantity)}
                </Text>
              </View>
            </View>

            {/* Status Badge */}
            <View style={styles.col}>
              <Text style={styles.label}>Status</Text>
              <View
                style={[
                  styles.badge,
                  item.status?.toLowerCase() === "discontinued"
                    ? styles.discontinued
                    : styles.active,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    item.status?.toLowerCase() === "discontinued"
                      ? styles.discontinuedText
                      : styles.activeText,
                  ]}
                >
                  {item.status || "N/A"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  const displayInventory =
    viewMode === 'all' ? inventoryData : recentInventory;

    const handleApplyFilter = (filter: AppliedFilter) => {
  console.log("Applied Filter:", filter);

  // 🔥 Example (client-side filter)
  const filtered = inventoryData.filter((item: any) => {
    const value = item[filter.field];

    if (!value) return false;

    return value
      .toString()
      .toLowerCase()
      .includes(filter.value.toLowerCase());
  });

  setInventoryData(filtered);
};

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <Header />
      <HeaderSection
        title="What services do you need?"
        buttonText="+ New Inventory"
        onButtonClick={handleCreateNew}
        onSearchPress={() => setFilterOpen(true)} // ✅ SEARCH CLICK
      />

      {/* Section header */}
      <View style={styles.headerRow}>
        <View style={styles.sectionHeader}>
          <Text style={styles.subTitle}>FSM</Text>
          <Text style={styles.title}>Inventory</Text>
          <Text style={styles.subtitle}>
            {inventoryData.length} item{inventoryData.length > 1 ? 's' : ''} • Updated just now
          </Text>
        </View>
        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setDropdownOpen((prev) => !prev)}
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
        data={displayInventory}
        keyExtractor={(item) => String(item.item_id)}
        renderItem={renderInventoryCard}
        contentContainerStyle={{ padding: 12 }}
      />
<FilterModal
  visible={filterOpen}
  module="inventory"
  onClose={() => setFilterOpen(false)}
  onApply={handleApplyFilter}
/>

    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { paddingHorizontal: 16, paddingTop: 10, backgroundColor: '#FFF' },
  subTitle: { fontSize: 12, fontWeight: '600', color: '#6234E2', flex: 1 },
  title: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#545454' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  col: { flex: 1, marginRight: 8 },
  label: { fontSize: 12, fontWeight: '500', color: '#6234E2', marginBottom: 4 },
  value: { fontSize: 13, fontWeight: '600', color: '#222' },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  lowStock: { backgroundColor: '#fff6db' },
  inStock: { backgroundColor: '#d8fff2' },
  lowStockText: { color: '#b58b00' },
  inStockText: { color: '#00a676' },
  discontinued: { backgroundColor: '#ffe5e5' },
  active: { backgroundColor: '#e7f6ff' },
  discontinuedText: { color: '#d22f2f' },
  activeText: { color: '#0284c7' },
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



