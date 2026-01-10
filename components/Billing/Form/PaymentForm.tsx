import { paymentService } from "@/src/api/auth";
import { getAllInvoices, SearchResult } from "@/src/api/searchInvoice";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FormHeader from "../../common/FormHeader";

type RouteProps = RouteProp<SearchMenuStackParamList, "CreatePayment">;

export default function CreatePayment() {
  const navigation =
    useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();

  const route = useRoute<RouteProps>();
  const { mode = "create", payment } = route.params || ({} as any);

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  const [customerId, setCustomerId] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("Select invoice");
  const [customerName, setCustomerName] = useState("");
  const [reference, setReference] = useState("");
  const [showInvoiceDropdown, setShowInvoiceDropdown] = useState(false);
  const [invoiceResults, setinvoiceResults] = useState<SearchResult[]>([]);
  const [customerResults, setCustomerResults] = useState<SearchResult[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateObj, setDateObj] = useState<Date>(new Date());

  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [method, setMethod] = useState<string>("cash");
  const [status, setStatus] = useState<string>("Completed");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [referenceNumber, setReferenceNumber] = useState<string>("");

  const [showPaymentMethodDropdown, setShowPaymentMethodDropdown] =
    useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);

    if (!selectedDate) return;

    setDateObj(selectedDate);

    const day = String(selectedDate.getDate()).padStart(2, "0");
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const year = selectedDate.getFullYear();

    setPaymentDate(`${month}/${day}/${year}`); // mm/dd/yyyy
  };

  useEffect(() => {
    if (payment && mode !== "create") {
      setInvoiceId(
        typeof payment.invoice_id === "object"
          ? payment.invoice_id.id
          : payment.invoice_id
      );

      setCustomerId(
        typeof payment.customer_id === "object"
          ? payment.customer_id.id
          : payment.customer_id
      );

      setInvoiceNumber(payment.invoice_number);
      setCustomerName(payment.customer_name);
      setAmount(String(payment.amount));
      setMethod(payment.method);
      setStatus(payment.status);
      setPaymentDate(payment.payment_date || "");
      setReference(payment.reference || "");
      setNotes(payment.notes || "");
    }
  }, [payment]);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const res = await getAllInvoices(""); // empty = all invoices
        setinvoiceResults(res || []);
      } catch (e) {
        console.log("Invoice fetch error", e);
      }
    };

    loadInvoices();
  }, []);

  useEffect(() => {
    console.log("Invoices:", invoiceResults);
  }, [invoiceResults]);

  useEffect(() => {
    if (!paymentDate) {
      const today = new Date();
      const formatted =
        String(today.getMonth() + 1).padStart(2, "0") +
        "/" +
        String(today.getDate()).padStart(2, "0") +
        "/" +
        today.getFullYear();

      setPaymentDate(formatted);
    }
  }, []);

  // ---------------- Select handlers ----------------
  const handleSelectInvoice = (inv: SearchResult) => {
    setInvoiceId(inv.id); // for backend
    setInvoiceNumber(inv.invoice_number || inv.name || "Invoice"); // for UI

    // ✅ auto customer
    if (inv.customer_id != null) {
      if (typeof inv.customer_id === "object") {
        setCustomerId(inv.customer_id.id);
        setCustomerName(inv.customer_id.name);
      } else {
        setCustomerId(inv.customer_id);
      }
    }

    if (inv.customer_name) {
      setCustomerName(inv.customer_name);
    }

    //  auto amount - try several common keys used by APIs
    const candidateAmount =
      (inv as any).amount ??
      (inv as any).total ??
      (inv as any).total_amount ??
      (inv as any).grand_total ??
      (inv as any).balance ??
      (inv as any).due ??
      (inv as any).invoice_amount;

    if (candidateAmount != null) {
      // Normalize to string with two decimals when it's a number
      const amtStr =
        typeof candidateAmount === "number"
          ? String(Number(candidateAmount).toFixed(2))
          : String(candidateAmount);
      setAmount(amtStr);
    }

    setShowInvoiceDropdown(false);
  };

  const handleSelectCustomer = (cust: SearchResult) => {
    setCustomerId(cust.id); // ✅ for backend
    setCustomerName(cust.name); // ✅ for UI
  };

  const handleSubmit = async () => {
    if (!invoiceId) {
      Alert.alert("Validation", "Invoice is required");
      return;
    }

    if (!customerId) {
      Alert.alert("Validation", "Customer is required");
      return;
    }

    try {
      const payload = {
        invoice_id: invoiceId, // ✅ REQUIRED
        customer_id: customerId, // ✅ REQUIRED
        invoice_number: invoiceNumber,
        customer_name: customerName,
        amount: Number(amount),
        method: paymentMethod,
        status: status,
        payment_date: paymentDate || null,
        reference: reference || null,
        notes: notes || null,
      };

      const isUpdating = Boolean(payment && (payment as any).id);

      if (isUpdating) {
        await paymentService.update((payment as any).id, payload);
        Alert.alert("Success", "Payment updated");
        navigation.goBack();
        return;
      }

      await paymentService.create(payload);
      Alert.alert("Success", "Payment created");
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong");
    }
  };

  const PAYMENT_METHOD_OPTIONS = [
    "Cash",
    "Credit Card",
    "Debit Card",
    "Bank Transfer",
    "Cheque",
    "UPI",
    "PayPal",
  ];

  const STATUS_OPTIONS = ["Completed", "Pending", "Failed"];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FormHeader
        title={
          isCreateMode
            ? "Add Payment"
            : isEditMode
            ? "Edit Payment"
            : "View Payment Information"
        }
        subtitle={
          isViewMode
            ? undefined
            : isEditMode
            ? "Edit an existing payment"
            : "Create a new payment record"
        }
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER ROW */}
        <View style={styles.headerRow}>
          <Text style={styles.subHeader}>PAYMENT INFORMATION</Text>

          {isViewMode && (
            <TouchableOpacity
              style={styles.editSmallButton}
              onPress={() =>
                navigation.navigate("CreatePayment", {
                  mode: "edit",
                  payment,
                })
              }
            >
              <Ionicons name="create-outline" size={16} color="#fff" />
              <Text style={styles.editSmallButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Invoice Selection */}
        <Text style={styles.label}>Invoice Selection</Text>
        <View style={styles.dropdownWrapper}>
          {isViewMode ? (
            <View style={styles.readOnly}>
              <Text>{invoiceNumber || "-"}</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowInvoiceDropdown(!showInvoiceDropdown)}
              >
                <Text style={styles.dropdownText}>
                  {invoiceNumber || "Select Invoice"}
                </Text>
                <Ionicons
                  name={showInvoiceDropdown ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#555"
                />
              </TouchableOpacity>

              {showInvoiceDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView
                    style={{ maxHeight: 200 }}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                  >
                    {invoiceResults.map((inv) => {
                      const amt =
                        (inv as any).amount ??
                        (inv as any).total ??
                        (inv as any).grand_total ??
                        (inv as any).total_amount ??
                        null;
                      const amtStr =
                        amt != null ? ` - $${Number(amt).toFixed(2)}` : "";
                      const cust =
                        inv.customer_name ??
                        (typeof inv.customer_id === "object"
                          ? (inv.customer_id as any)?.name
                          : inv.customer_id ?? "");
                      const label = `${
                        inv.invoice_number || inv.name || inv.id
                      }${cust ? ` - ${cust}` : ""}${amtStr}`;

                      return (
                        <TouchableOpacity
                          key={inv.id}
                          style={styles.dropdownItem}
                          onPress={() => {
                            handleSelectInvoice(inv);
                          }}
                        >
                          <Text>{label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </>
          )}
        </View>

        {/* Payment Details */}
        <Text style={styles.sectionTitle}>Payment Details</Text>

        {/* Customer */}
        <Text style={styles.label}>Customer *</Text>
        {/*<Text style={styles.dropdownText}>
          {customerName || "Select Customer"}
        </Text>*/}

        <View style={styles.readOnly}>
          <Text>{customerName || "-"}</Text>
        </View>
        <Text style={styles.helperText}>
          Auto-populated from selected invoice
        </Text>

        {/* Payment Date & Amount */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Payment Date *</Text>
            <TouchableOpacity
              style={styles.dateInputWrapper}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.dateText}>{paymentDate || "mm/dd/yyyy"}</Text>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dateObj}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onChangeDate}
              />
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Amount *</Text>

            {isViewMode ? (
              <View style={styles.readOnly}>
                <Text>{amount || "-"}</Text>
              </View>
            ) : invoiceId ? (
              <View style={styles.readOnly}>
                <Text>{amount || "-"}</Text>
              </View>
            ) : (
              <TextInput
                style={[styles.input, styles.inputSmall]}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                editable={!isViewMode}
              />
            )}

            <Text style={styles.helperText}>
              Auto-populated from invoice total
            </Text>
          </View>
        </View>

        {/* Payment Method & Status */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Payment Method *</Text>

            <View style={styles.dropdownWrapper}>
              <TouchableOpacity
                style={styles.dropdown}
                disabled={isViewMode}
                onPress={() => {
                  if (isViewMode) return;
                  setShowPaymentMethodDropdown(!showPaymentMethodDropdown);
                  setShowStatusDropdown(false);
                }}
              >
                <Text style={styles.dropdownText}>
                  {paymentMethod || "Select Method"}
                </Text>
                <Ionicons
                  name={
                    showPaymentMethodDropdown ? "chevron-up" : "chevron-down"
                  }
                  size={16}
                  color="#555"
                />
              </TouchableOpacity>

              {showPaymentMethodDropdown && !isViewMode && (
                <View style={styles.dropdownList}>
                  {PAYMENT_METHOD_OPTIONS.map((method) => (
                    <TouchableOpacity
                      key={method}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setPaymentMethod(method);
                        setShowPaymentMethodDropdown(false);
                      }}
                    >
                      <Text>{method}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Status *</Text>
            <View style={styles.dropdownWrapper}>
              <TouchableOpacity
                style={styles.dropdown}
                disabled={isViewMode}
                onPress={() => {
                  if (isViewMode) return;
                  setShowStatusDropdown(!showStatusDropdown);
                  setShowPaymentMethodDropdown(false);
                }}
              >
                <Text style={styles.dropdownText}>{status}</Text>
                <Ionicons
                  name={showStatusDropdown ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#555"
                />
              </TouchableOpacity>

              {showStatusDropdown && !isViewMode && (
                <View style={styles.dropdownList}>
                  {STATUS_OPTIONS.map((stat) => (
                    <TouchableOpacity
                      key={stat}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setStatus(stat);
                        setShowStatusDropdown(false);
                      }}
                    >
                      <Text>{stat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Reference Number */}
        <Text style={styles.label}>Reference Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Transaction/Reference Number"
          value={referenceNumber}
          onChangeText={setReferenceNumber}
          editable={!isViewMode}
        />

        {/* Notes */}
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any additional remarks or notes"
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
          editable={!isViewMode}
        />

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {(isCreateMode || isEditMode) && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>
                {isEditMode ? "Update" : "Create Payment"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 16,
  },
  dateInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
  },
  dateText: {
    fontSize: 14,
    color: "#111827",
  },
  dateInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    color: "#111827",
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
    marginTop: 12,
  },

  helperText: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#F9FAFB",
  },

  inputSmall: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 6,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  textArea: {
    height: 90,
    textAlignVertical: "top",
  },

  dropdownWrapper: {
    position: "relative",
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
  },

  dropdownText: {
    fontSize: 14,
    color: "#111827",
  },

  dropdownList: {
    position: "absolute",
    top: 50,
    width: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    zIndex: 9999,

    // Android shadow
    elevation: 6,

    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  row: {
    flexDirection: "row",
    marginTop: 8,
  },

  readOnly: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 6,
  },

  buttonContainer: {
    marginTop: 24,
  },

  saveButton: {
    backgroundColor: "#5B3DF5",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 12,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },

  cancelBtn: {
    backgroundColor: "#4B5563",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
  },

  cancelBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  formHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  topBarLeft: {
    width: 40,
    alignItems: "flex-start",
  },
  topBarCenter: {
    flex: 1,
    alignItems: "center",
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  topBarSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  iconBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
  },
  editSmallButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6234E2",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  editSmallButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
});
