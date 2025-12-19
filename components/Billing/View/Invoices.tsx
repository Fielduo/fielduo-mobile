import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
} from "react-native";
import Header from "../../common/Header";
import HeaderSection from "../../common/HeaderSection";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { api } from "@/src/api/cilent";
import FilterModal, { AppliedFilter } from "@/components/common/FilterModal";
import { Ionicons } from "@expo/vector-icons";



// --- Types ---
export interface Invoice {
  id: string;
  invoice_number: string;
  currency: string;
  status_name: string;
  customer_name: string;
  total: number;
  updated_At: string; // updated_by_name
}

// --- Main Component ---
const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState<AppliedFilter | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'all' | 'recent'>('all');
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);

  const navigation =
    useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();

  useEffect(() => {
    fetchInvoices();
  }, []);

  // --------------------------
  // API CALL
  // --------------------------
  const fetchInvoices = async () => {
    try {
      setLoading(true);

      const list = await api.get<any[]>("/invoices");

      const formatted: Invoice[] = list.map((inv: any) => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        currency: inv.currency || "N/A",
        status_name: inv.status_name || inv.status || "N/A",
        customer_name: inv.customer_name || "Unknown",
        total: inv.total_amount || 0,
        updated_At: inv.due_date || "-",
      }));

      setInvoices(formatted);

    } catch (error) {
      console.error("Error fetching invoices:", error);
      Alert.alert("Error", "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };


  const handleCreateNewInvoice = () => {
    navigation.navigate("InvoicesForm", {
      mode: "create",
      data: null,
    });
  };

  const handleInvoiceCardPress = (invoice: Invoice) => {
    // Navigate
    navigation.navigate("InvoicesForm", {
      mode: "view",
      data: invoice,
    });

    // Track recently viewed
    setRecentlyViewedIds((prev) => {
      const updated = [invoice.id, ...prev.filter((id) => id !== invoice.id)];
      return updated.slice(0, 20); // Keep last 20 viewed invoices
    });
  };



  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === "-") return "-";   // prevent invalid date

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";         // prevent broken date

    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };
  const handleApplyFilter = (filter: AppliedFilter) => {
    setAppliedFilter(filter);
  };
  const filteredInvoices = appliedFilter
    ? invoices.filter((inv) => {
      const fieldValue = (inv as any)[appliedFilter.field];
      if (!fieldValue) return false;

      switch (appliedFilter.operator) {
        case 'equals':
          return String(fieldValue).toLowerCase() === appliedFilter.value.toLowerCase();
        case 'contains':
          return String(fieldValue).toLowerCase().includes(appliedFilter.value.toLowerCase());
        case 'startsWith':
          return String(fieldValue).toLowerCase().startsWith(appliedFilter.value.toLowerCase());
        case 'endsWith':
          return String(fieldValue).toLowerCase().endsWith(appliedFilter.value.toLowerCase());
        case 'greaterThan':
          return Number(fieldValue) > Number(appliedFilter.value);
        case 'lessThan':
          return Number(fieldValue) < Number(appliedFilter.value);
        default:
          return true;
      }
    })
    : invoices;

  const displayedInvoices =
    viewMode === 'recent'
      ? filteredInvoices.filter((inv) => recentlyViewedIds.includes(inv.id))
      : filteredInvoices;

  const renderInvoiceCard = ({ item }: { item: Invoice }) => {
    return (
      <TouchableOpacity onPress={() => handleInvoiceCardPress(item)}>

        <View style={styles.card}>
          {/* Row 1 */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Invoice Number</Text>
              <Text style={styles.value}>{item.invoice_number}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Customer</Text>
              <Text style={styles.value}>{item.customer_name}</Text>
            </View>
          </View>

          {/* Row 2 */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Status</Text>
              <Text style={styles.value}>{item.status_name}</Text>
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Currency</Text>
              <Text style={styles.value}>{item.currency}</Text>
            </View>
          </View>

          {/* Row 3 */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Updated By</Text>
              <Text style={styles.value}>{formatDate(item.updated_At)}</Text>

            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Total</Text>
              <Text style={styles.value}>{item.currency} {item.total}</Text>
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
        title="What services do you need?"
        buttonText="+ New Invoice"
        onButtonClick={handleCreateNewInvoice}
        onSearchPress={() => setFilterVisible(true)}

      />
      <ScrollView style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.sectionHeader}>
            <Text style={styles.subTitle}>FSM</Text>
            <Text style={styles.title}>Invoices</Text>
            <Text style={styles.subtitle}>
              {loading ? "Loading..." : "Updated just now"}
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
          data={displayedInvoices}
          keyExtractor={(item) => item.id}
          renderItem={renderInvoiceCard}
          ListEmptyComponent={
            !loading ? (
              <Text style={{ textAlign: "center", marginTop: 20 }}>
                No invoices found.
              </Text>
            ) : null
          }
        />


        <FilterModal
          visible={filterVisible}
          module="invoices"
          onClose={() => setFilterVisible(false)}
          onApply={handleApplyFilter}
        />

      </ScrollView>
    </View>

  );
};

export default Invoices;

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 4,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#101318",
  },
  sectionHeader: {

    paddingTop: 10,
    backgroundColor: "#FFF",
  },
  subTitle: {
    flex: 1,
    color: "#6234E2",
    fontSize: 12,
    fontWeight: "600",
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
