import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import Header from "../../common/Header";
import HeaderSection from "../../common/HeaderSection";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { api } from "@/src/api/cilent";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import FilterModal, { AppliedFilter } from "@/components/common/FilterModal";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";


// UI type
type UIContract = {
  id: string;
  contractNumber: string;
  contractName: string;
  account: string;
  grandTotal: number;
  startDate: string;
  endDate: string;
  raw: any; // full snake_case database response
};

export default function ServiceContract() {
  const navigation =
    useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();
  const [searchText, setSearchText] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState<AppliedFilter | null>(null);
  const [contracts, setContracts] = useState<UIContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  type ViewMode = 'all' | 'recent';
  const [recentContracts, setRecentContracts] = useState<UIContract[]>([]);
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('recentContracts');
      if (stored) setRecentContracts(JSON.parse(stored));
    })();
  }, []);
  // =========================================
  // 🚀 FETCH SERVICE CONTRACTS FROM API
  // =========================================
  const fetchContracts = async () => {
    try {
      setLoading(true);
      console.log("📡 Fetching service contracts...");

      const res: any = await api.get("/service_contract");

      console.log("📥 RAW API Response:", res);

      if (res?.success && Array.isArray(res.contracts)) {
        console.log("📦 Server Contracts:", res.contracts);

        // 🔥 Correct UI + RAW object separation
        const mapped: UIContract[] = res.contracts.map((item: any) => ({
          id: item.id,
          contractNumber: item.contract_number,
          contractName: item.contract_name,
          account: item.account_name,
          grandTotal: item.grand_total,
          startDate: item.start_date,
          endDate: item.end_date,

          raw: {
            id: item.id,
            contract_owner: item.contract_owner,
            contract_number: item.contract_number,
            contract_name: item.contract_name,
            account_name: item.account_name,
            contact_name: item.contact_name,
            term_months: item.term_months,

            description: item.description,
            special_terms: item.special_terms,

            start_date: item.start_date,
            end_date: item.end_date,

            discount: item.discount,
            shipping_handling: item.shipping_handling,
            tax: item.tax,
            grand_total: item.grand_total,

            billing_street: item.billing_street,
            billing_city: item.billing_city,
            billing_zip: item.billing_zip,
            billing_state: item.billing_state,
            billing_country: item.billing_country,

            shipping_street: item.shipping_street,
            shipping_city: item.shipping_city,
            shipping_zip: item.shipping_zip,
            shipping_state: item.shipping_state,
            shipping_country: item.shipping_country,
          }


        }));

        console.log("🛠️ MAPPED Contracts for UI:", mapped);

        setContracts(mapped);
      } else {
        console.log("⚠️ Invalid API Format");
        setContracts([]);
      }
    } catch (err) {
      console.log("❌ Fetch Error:", err);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // ================================
  // 👉 Navigate to view/edit
  // ================================
  const handleCardPress = async (item: UIContract) => {
    console.log("📤 Navigating With RAW Contract →", item.raw);

    // Save recent view
    try {
      const stored = await AsyncStorage.getItem('recentContracts');
      let recent: UIContract[] = stored ? JSON.parse(stored) : [];

      // Remove if already exists
      recent = recent.filter(rc => rc.id !== item.id);

      // Add new on top
      recent.unshift(item);

      // Limit recent to 10
      if (recent.length > 10) recent = recent.slice(0, 10);

      await AsyncStorage.setItem('recentContracts', JSON.stringify(recent));
      setRecentContracts(recent);
    } catch (err) {
      console.log('Error saving recent contracts:', err);
    }

    // Navigate to view
    navigation.navigate("CreateServiceContract", {
      mode: "view",
      servicecontract: item.raw,
    });
  };


  // ================================
  // ➕ Create New
  // ================================
  const handleCreateNew = () => {
    navigation.navigate("CreateServiceContract", { mode: "create" });
  };

  // ================================
  // Date formatter
  // ================================
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const filteredContracts = (viewMode === 'recent' ? recentContracts : contracts).filter((c) => {
    // 🔍 Search
    const matchesSearch =
      c.contractNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      c.contractName.toLowerCase().includes(searchText.toLowerCase()) ||
      c.account.toLowerCase().includes(searchText.toLowerCase());

    if (!matchesSearch) return false;

    // 🎯 Applied filter
    if (!appliedFilter) return true;

    const rawValue = c.raw[appliedFilter.field];
    if (!rawValue) return false;

    return rawValue.toString().toLowerCase().includes(appliedFilter.value.toLowerCase());
  });


  // ================================
  // Render Card
  // ================================
  const renderContractCard = ({ item }: { item: UIContract }) => (
    <TouchableOpacity onPress={() => handleCardPress(item)}>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Contract Number</Text>
            <Text style={styles.value}>{item.contractNumber}</Text>
          </View>

          <View style={styles.dividerVertical} />

          <View style={styles.column}>
            <Text style={styles.label}>Contract Name</Text>
            <Text style={styles.value}>{item.contractName}</Text>
          </View>
        </View>

        <View style={styles.dividerHorizontal} />

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Account</Text>
            <Text style={styles.value}>{item.account}</Text>
          </View>

          <View style={styles.dividerVertical} />

          <View style={styles.column}>
            <Text style={styles.label}>Grand Total</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.grandTotal}</Text>
            </View>
          </View>
        </View>

        <View style={styles.dividerHorizontal} />

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Start Date</Text>
            <Text style={styles.value}>{formatDate(item.startDate)}</Text>
          </View>

          <View style={styles.dividerVertical} />

          <View style={styles.column}>
            <Text style={styles.label}>End Date</Text>
            <Text style={styles.value}>{formatDate(item.endDate)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <Header />

      <HeaderSection
        title="Service Contracts"
        buttonText="+ New Contract"
        onButtonClick={handleCreateNew}
        onSearchPress={() => setFilterVisible(true)}
      />

      <View style={styles.headerRow}>
        <View style={styles.sectionHeader}>
          <Text style={styles.subtitle}>FSM</Text>
          <Text style={styles.title}>Service Contracts</Text>
          <Text style={styles.subtitle}>Updated just now</Text>
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
      {loading ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>Loading...</Text>
      ) : (
        <FlatList
          data={filteredContracts}

          keyExtractor={(item) => item.id.toString()}
          renderItem={renderContractCard}
          contentContainerStyle={{ padding: 12 }}
        />
      )}
      <FilterModal
        visible={filterVisible}
        module="service_contract" // 🔥 MUST MATCH CONFIG
        onClose={() => setFilterVisible(false)}
        onApply={(filter) => {
          setAppliedFilter(filter);
          setFilterVisible(false);
        }}
      />

    </View>
  );
}

// ================================
// Styles
// ================================
const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "#FFF",
  },
  subtitle: {
    color: "#6234E2",
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#101318",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
    padding: 6,
  },
  label: {
    fontSize: 12,
    color: "#6234E2",
    fontWeight: "500",
    marginBottom: 3,
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    color: "#222",
  },
  badge: {
    backgroundColor: "#EAFBF3",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: "#00A676",
    fontWeight: "600",
    fontSize: 13,
  },
  dividerVertical: {
    width: 1,
    height: "100%",
    backgroundColor: "#E5E7EB",
  },
  dividerHorizontal: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 4,
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
