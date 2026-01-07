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
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ViewMode = "all" | "recent";

// UI type
type UIContract = {
  id: string;
  contractNumber: string;
  contractName: string;
  account: string;
  grandTotal: number;
  startDate: string;
  endDate: string;
  raw: any;
};

export default function ServiceContract() {
  const navigation =
    useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();

  const [contracts, setContracts] = useState<UIContract[]>([]);
  const [recentContracts, setRecentContracts] = useState<UIContract[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("all");

  // ================================
  // Load recent
  // ================================
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem("recentContracts");
      if (stored) setRecentContracts(JSON.parse(stored));
    })();
  }, []);

  // ================================
  // Fetch contracts
  // ================================
  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res: any = await api.get("/service_contract");

      if (res?.success && Array.isArray(res.contracts)) {
        const mapped: UIContract[] = res.contracts.map((item: any) => ({
          id: item.id,
          contractNumber: item.contract_number,
          contractName: item.contract_name,
          account: item.account_name,
          grandTotal: item.grand_total,
          startDate: item.start_date,
          endDate: item.end_date,
          raw: item,
        }));
        setContracts(mapped);
      } else {
        setContracts([]);
      }
    } catch (err) {
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // ================================
  // Card click
  // ================================
  const handleCardPress = async (item: UIContract) => {
    let recent = [...recentContracts.filter((r) => r.id !== item.id)];
    recent.unshift(item);
    if (recent.length > 10) recent = recent.slice(0, 10);

    await AsyncStorage.setItem("recentContracts", JSON.stringify(recent));
    setRecentContracts(recent);

    navigation.navigate("CreateServiceContract", {
      mode: "view",
      servicecontract: item.raw,
    });
  };

  const handleCreateNew = () => {
    navigation.navigate("CreateServiceContract", { mode: "create" });
  };

  // ================================
  // Search + View Mode filter
  // ================================
  const sourceData = viewMode === "recent" ? recentContracts : contracts;

  const filteredContracts = sourceData.filter((c) => {
    if (!searchText.trim()) return true;

    const text = searchText.toLowerCase();
    return (
      c.contractNumber.toLowerCase().includes(text) ||
      c.contractName.toLowerCase().includes(text) ||
      c.account.toLowerCase().includes(text)
    );
  });

  const formatDate = (date: string) => {
    if (!date) return "-";
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, "0")}-${(
      d.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${d.getFullYear()}`;
  };

  // ================================
  // Render card
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

      {/* 🔍 DIRECT SEARCH */}
      <HeaderSection
        title="Service Contracts"
        buttonText="+ New Contract"
        onButtonClick={handleCreateNew}
        searchValue={searchText}
        onSearchChange={setSearchText}
      />

      {/* View mode */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Service Contracts</Text>

              {/* View mode */}
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
          keyExtractor={(item) => item.id}
          renderItem={renderContractCard}
          contentContainerStyle={{ padding: 12 }}
        />
      )}
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
