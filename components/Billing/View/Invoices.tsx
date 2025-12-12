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
    navigation.navigate("InvoicesForm", {
      mode: "view",
      data: invoice,
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
        onSearchChange={(text) => console.log("Searching Invoices:", text)}
      />
      <ScrollView style={styles.container}>
       
          <Text style={styles.subTitle}>FSM</Text>
          <Text style={styles.title}>Invoices</Text>
          <Text style={styles.subtitle}>
            {loading ? "Loading..." : "Updated just now"}
          </Text>
       

        <FlatList
          data={invoices}
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
});
