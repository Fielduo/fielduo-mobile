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


// --- Types ---
export interface Payment {
  id: string;
  invoice_number: string;
  amount: number;
  status_name: string;
  customer_name: string;
  method: string;
  notes?: string;
  payment_date?: string;
  reference?: string;
  created_at?: string;
}

// --- Main Component ---
const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const navigation =
    useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // TODO: replace with real API call
      // const response = await ApiWrapper.get('/payments');
      // setPayments(response.data.payments);

      const sample: Payment[] = [
        {
          id: "1",
          invoice_number: "INV-1001",
          amount: 23600,
          status_name: "Paid",
          customer_name: "John Doe",
          method: "UPI",
          notes: "Paid via GPay",
          payment_date: "2025-11-15",
          reference: "TXN123456",
          created_at: "2025-11-15",
        },
        {
          id: "2",
          invoice_number: "INV-1002",
          amount: 1770,
          status_name: "Pending",
          customer_name: "Jane Smith",
          method: "Bank Transfer",
          notes: "Awaiting confirmation",
          payment_date: "2025-11-18",
          reference: "NEFT987654",
          created_at: "2025-11-18",
        },
      ];

      setPayments(sample);
    } catch (error) {
      console.error("Error fetching payments:", error);
      Alert.alert("Error", "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewPayment = () => {
    // navigation.navigate("CreatePayment");
    console.log("Create new payment");
  };

  const handlePaymentCardPress = (payment: Payment) => {
    // navigation.navigate("PaymentDetails", { id: payment.id });
    console.log("Pressed payment:", payment.id);
  };

  const renderPaymentCard = ({ item }: { item: Payment }) => {
    return (
      <TouchableOpacity onPress={() => handlePaymentCardPress(item)}>
        <View style={styles.card}>
          {/* Row 1: Invoice | Amount | Status */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Invoice</Text>
              <Text style={styles.value}>{item.invoice_number}</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.col}>
              <Text style={styles.label}>Amount</Text>
              <Text style={styles.value}>{item.amount}</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.col}>
              <Text style={styles.label}>Status</Text>
              <View
                style={[
                  styles.badge,
                  item.status_name === "Paid"
                    ? styles.completed
                    : item.status_name === "Pending"
                    ? styles.inProgress
                    : styles.pending,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    item.status_name === "Paid"
                      ? styles.completedText
                      : item.status_name === "Pending"
                      ? styles.inProgressText
                      : styles.pendingText,
                  ]}
                >
                  {item.status_name}
                </Text>
              </View>
            </View>
          </View>

          {/* Row 2: Customer | Method | Notes */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Customer</Text>
              <Text style={styles.value}>{item.customer_name}</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.col}>
              <Text style={styles.label}>Method</Text>
              <Text style={styles.value}>{item.method}</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.col}>
              <Text style={styles.label}>Notes</Text>
              <Text
                style={styles.value}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.notes || "-"}
              </Text>
            </View>
          </View>

          {/* Row 3: Payment Date | Reference | Created At */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Payment Date</Text>
              <Text style={styles.value}>
                {item.payment_date
                  ? new Date(item.payment_date).toLocaleDateString("en-IN")
                  : "-"}
              </Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.col}>
              <Text style={styles.label}>Reference</Text>
              <Text style={styles.value}>{item.reference || "-"}</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.col}>
              <Text style={styles.label}>Created At</Text>
              <Text style={styles.value}>
                {item.created_at
                  ? new Date(item.created_at).toLocaleDateString("en-IN")
                  : "-"}
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
        title="What services do you need?"
        buttonText="+ New Payment"
        onButtonClick={handleCreateNewPayment}
        onSearchChange={(text) => console.log("Searching Payments:", text)}
      />

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.subTitle}>FSM</Text>
        <Text style={styles.title}>Payments</Text>
        <Text style={styles.subtitle}>
          {loading ? "Loading..." : "Updated just now"}
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        renderItem={renderPaymentCard}
        contentContainerStyle={{ padding: 12 }}
      />
    </View>
  );
};

export default Payments;

// --- Styles: same as Quotes / Feedback with divider ---
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
