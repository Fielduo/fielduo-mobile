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

type ViewMode = "all" | "recent";

export default function InventoryScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();

  const [inventoryData, setInventoryData] = useState<Inventory[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<Inventory[]>([]);
  const [recentInventory, setRecentInventory] = useState<Inventory[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("all");

  /* ---------------- FETCH INVENTORY ---------------- */
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await api.get<Inventory[]>("/inventory");
      setInventoryData(data || []);
      setFilteredInventory(data || []);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  /* ---------------- DIRECT SEARCH ---------------- */
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredInventory(inventoryData);
      return;
    }

    const text = searchText.toLowerCase();

    const result = inventoryData.filter((item) =>
      Object.values(item).some(
        (val) =>
          val &&
          val.toString().toLowerCase().includes(text)
      )
    );

    setFilteredInventory(result);
  }, [searchText, inventoryData]);

  /* ---------------- VIEW MODE ---------------- */
  const displayInventory =
    viewMode === "all" ? filteredInventory : recentInventory;

  /* ---------------- ACTIONS ---------------- */
  const handleCreateNew = () => {
    navigation.navigate("CreateInventory", { mode: "create" });
  };

  const handleCardPress = (inventory: Inventory) => {
    setRecentInventory((prev) => {
      const exists = prev.find(
        (i) => i.item_id === inventory.item_id
      );
      if (exists) return prev;
      return [inventory, ...prev].slice(0, 5);
    });

    navigation.navigate("CreateInventory", {
      mode: "view",
      inventory,
    });
  };

  const getStockLabel = (qty: number | null) => {
    if (qty == null) return "N/A";
    if (qty === 0) return "Out of Stock";
    if (qty < 10) return "Low Stock";
    return "In Stock";
  };

  const isLowStock = (qty: number | null) =>
    qty !== null && qty > 0 && qty < 10;

  /* ---------------- CARD UI ---------------- */
  const renderInventoryCard = ({ item }: { item: Inventory }) => (
    <TouchableOpacity onPress={() => handleCardPress(item)}>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Item Number</Text>
            <Text style={styles.value}>
              {item.item_number ?? item.item_id}
            </Text>
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

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Category</Text>
            <Text style={styles.value}>{item.category || "-"}</Text>
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Stock</Text>
            <View
              style={[
                styles.badge,
                isLowStock(item.stock_quantity)
                  ? styles.lowStock
                  : styles.inStock,
              ]}
            >
              <Text style={styles.badgeText}>
                {getStockLabel(item.stock_quantity)}
              </Text>
            </View>
          </View>

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
              <Text style={styles.badgeText}>
                {item.status || "N/A"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  /* ---------------- UI ---------------- */
  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <Header />

      <HeaderSection
        title="What services do you need?"
        buttonText="+ New Inventory"
        onButtonClick={handleCreateNew}
        searchValue={searchText}
        onSearchChange={setSearchText}   // ✅ DIRECT SEARCH
      />

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.subTitle}>FSM</Text>
          <Text style={styles.title}>Inventory</Text>
          <Text style={styles.subtitle}>
            {displayInventory.length} items • Updated just now
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
            <Ionicons name="chevron-down-outline" size={16} />
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

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={displayInventory}
          keyExtractor={(item, index) =>
            `${item.item_id}-${index}`
          }
          renderItem={renderInventoryCard}
          contentContainerStyle={{ padding: 12 }}
        />
      )}
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



