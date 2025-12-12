import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import FormHeader from "../../common/FormHeader";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import NumericInput from "../../common/numeric -input";
import { Ionicons } from "@expo/vector-icons";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { api } from "@/src/api/cilent";


export default function CreateServiceContractScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();

  const route = useRoute<
    RouteProp<SearchMenuStackParamList, "CreateServiceContract">
  >();

  const params = route.params ?? {};
  const mode = params.mode ?? "create";
  const servicecontract = params.servicecontract ?? null;

  console.log("💥 FINAL PARAMS:", params);
  console.log("💥 servicecontract:", servicecontract);
  console.log("💥 mode:", mode);


  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  // ----------------------- STATES -----------------------
  const [contractOwner, setContractOwner] = useState("");
  const [contractNumber, setContractNumber] = useState("");
  const [contractName, setContractName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [contactName, setContactName] = useState("");
  const [termMonths, setTermMonths] = useState("");

  // Billing
  const [billingStreet, setBillingStreet] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingZip, setBillingZip] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingCountry, setBillingCountry] = useState("");

  // Shipping
  const [shippingStreet, setShippingStreet] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingZip, setShippingZip] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingCountry, setShippingCountry] = useState("");

  // Dates
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  // Financials
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [tax, setTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [specialTerms, setSpecialTerms] = useState("");

  // ----------------------- PREFILL -----------------------
  useEffect(() => {
    console.log("🟦 Incoming servicecontract data:", servicecontract);

    if (!servicecontract) {
      console.log("⚠️ servicecontract is NULL or UNDEFINED");
      return;
    }

    // BASIC INFO
    console.log("➡️ Prefilling Basic Info");
    setContractOwner(servicecontract.contract_owner || "");
    setContractNumber(servicecontract.contract_number || "");
    setContractName(servicecontract.contract_name || "");
    setAccountName(servicecontract.account_name || "");
    setContactName(servicecontract.contact_name || "");
    setTermMonths(servicecontract.term_months?.toString() || "");

    // DESCRIPTION & TERMS
    console.log("➡️ Prefilling Description & Terms");
    setNotes(servicecontract.description || "");
    setSpecialTerms(servicecontract.special_terms || "");

    // DATES
    console.log("➡️ Prefilling Dates:", {
      start_date: servicecontract.start_date,
      actual_start_date: servicecontract.actual_start_date,
    });
    setStartDate(
      servicecontract.start_date ? new Date(servicecontract.start_date) : undefined
    );
    setEndDate(
      servicecontract.end_date
        ? new Date(servicecontract.end_date)
        : undefined
    );


    // FINANCIAL
    console.log("➡️ Prefilling Financial Data");
    setDiscount(servicecontract.discount || 0);
    setShipping(servicecontract.shipping_handling || 0);
    setTax(servicecontract.tax || 0);
    setGrandTotal(servicecontract.grand_total || 0);

    // BILLING ADDRESS
    console.log("➡️ Prefilling Billing Address");
    setBillingStreet(servicecontract.billing_street || "");
    setBillingCity(servicecontract.billing_city || "");
    setBillingZip(servicecontract.billing_zip || "");
    setBillingState(servicecontract.billing_state || "");
    setBillingCountry(servicecontract.billing_country || "");

    // SHIPPING ADDRESS
    console.log("➡️ Prefilling Shipping Address");
    setShippingStreet(servicecontract.shipping_street || "");
    setShippingCity(servicecontract.shipping_city || "");
    setShippingZip(servicecontract.shipping_zip || "");
    setShippingState(servicecontract.shipping_state || "");
    setShippingCountry(servicecontract.shipping_country || "");

    console.log("✅ Prefill Completed");
  }, [servicecontract]);

  const formatDate = (date?: Date | null) => {
    if (!date) return null;
    return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
  };

  const handleCreate = async () => {
    if (!contractName || contractName.trim() === "") {
      alert("Contract Name is required!");
      return;
    }


    try {
      const payload = {
        contractOwner: contractOwner,
        contractNumber: contractNumber,
        contractName: contractName.trim(),
        description: notes.trim(),
        accountName: accountName.trim(),
        contactName: contactName,

        startDate: startDate ? formatDate(startDate) : null,
        endDate: endDate ? formatDate(endDate) : null,
        termMonths: Number(termMonths),

        specialTerms: specialTerms,
        discount: discount,
        shippingHandling: shipping,
        tax: tax,
        grandTotal: grandTotal,

        billingStreet: billingStreet,
        billingCity: billingCity,
        billingZip: billingZip,
        billingState: billingState,
        billingCountry: billingCountry,

        shippingStreet: shippingStreet,
        shippingCity: shippingCity,
        shippingZip: shippingZip,
        shippingState: shippingState,
        shippingCountry: shippingCountry,
      };


      console.log("Create Payload:", payload);
      console.log("Sending Payload:", JSON.stringify(payload, null, 2));
      await api.post("/service_contract", payload);

      alert("Service Contract Created!");
      navigation.goBack();
    } catch (err: any) {
      console.log("Create error:", err.response?.data || err);
      alert("Create failed");
    }
  };

  console.log("💥 ROUTE PARAMS:", route.params);
  console.log("💥 servicecontract =", servicecontract);
  console.log("💥 mode =", mode);

  // ----------------------- UPDATE -----------------------
  const handleUpdate = async () => {
    if (!servicecontract?.id) return alert("Missing ID!");

    try {
      const payload = {
        contract_owner: contractOwner,
        contract_number: contractNumber,
        contract_name: contractName.trim(),
        description: notes.trim(),
        account_name: accountName.trim(),
        contact_name: contactName,

        start_date: startDate ? formatDate(startDate) : null,
        end_date: endDate ? formatDate(endDate) : null,
        term_months: Number(termMonths),

        special_terms: specialTerms,
        discount: discount,
        shipping_handling: shipping,
        tax: tax,
        grand_total: grandTotal,

        billing_street: billingStreet,
        billing_city: billingCity,
        billing_zip: billingZip,
        billing_state: billingState,
        billing_country: billingCountry,

        shipping_street: shippingStreet,
        shipping_city: shippingCity,
        shipping_zip: shippingZip,
        shipping_state: shippingState,
        shipping_country: shippingCountry,
      };


      console.log("Update Payload:", payload);

      await api.put(`/service_contract/${servicecontract.id}`, payload);
      alert("Updated!");
      navigation.goBack();
    } catch (err: any) {
      console.log("Update error:", err.response?.data || err);
      alert("Update failed!");
    }
  };


  // ----------------------- DELETE -----------------------
  const handleDelete = async () => {
    if (!servicecontract?.id) return;

    try {
      await api.delete(`/service_contract/${servicecontract.id}`);
      alert("Deleted!");
      navigation.goBack();
    } catch (err: any) {
      console.log("Delete error:", err.response?.data || err);
      alert("Delete failed!");
    }
  };

  const editable = !isView;

  // -------------------------------------------------------
  // ----------------------- UI ----------------------------
  // -------------------------------------------------------
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FormHeader
        title={
          isCreate
            ? "Create Service Contract"
            : isEdit
              ? "Edit Service Contract"
              : "View Service Contract"
        }
        subtitle={
          isCreate
            ? "Add a new Service Contract"
            : isEdit
              ? "Update existing contract"
              : "Service Contract Details"
        }
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionHeader}>Service Contract Information</Text>

          {isView && (
            <TouchableOpacity
              style={styles.editSmallButton}
              onPress={() =>
                navigation.navigate("CreateServiceContract", {
                  mode: "edit",
                  servicecontract,
                })
              }
            >
              <Ionicons name="create-outline" size={16} color="#fff" />
              <Text style={styles.editSmallButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ------------------ FORM START ------------------ */}

        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Contract Owner</Text>
              {isView ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{contractOwner || "-"}</Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={contractOwner}
                  onChangeText={setContractOwner}
                  placeholder="Contract Owner"
                  editable={editable}
                />
              )}
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>Contract Number</Text>
              {isView ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{contractNumber || "-"}</Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={contractNumber}
                  onChangeText={setContractNumber}
                  placeholder="Contract Number"
                  editable={editable}
                />
              )}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Contract Name *</Text>
              {isView ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{contractName || "-"}</Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={contractName}
                  onChangeText={setContractName}
                  editable={editable}
                  placeholder="Enter Contract Name"
                />
              )}
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>Account Name *</Text>
              {isView ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{accountName || "-"}</Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={accountName}
                  onChangeText={setAccountName}
                  editable={editable}
                  placeholder="Enter account name"
                />
              )}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Contact Name</Text>
              {isView ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{contactName || "-"}</Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={contactName}
                  onChangeText={setContactName}
                  placeholder="Contact Name"
                  editable={editable}
                />
              )}
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>Term (months)</Text>
              {isView ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{termMonths || "-"}</Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={termMonths}
                  onChangeText={setTermMonths}
                  editable={editable}
                  keyboardType="numeric"
                  placeholder="Months"
                />
              )}
            </View>
          </View>

          <Text style={styles.label}>Description</Text>
          {isView ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>{notes || "-"}</Text>
            </View>
          ) : (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              editable={editable}
              multiline
            />
          )}
        </View>

        <View style={styles.divider} />

        {/* ------------------ DATES ------------------ */}

        <Text style={styles.sectionHeader}>Dates & Terms</Text>

        <View style={styles.section}>
          <View style={styles.row}>
            {/* Start Date */}
            <View style={styles.column}>
              <Text style={styles.label}>Scheduled Start Date</Text>
              {isView ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{startDate ? startDate.toDateString() : ""}</Text>
                </View>
              ) : (
                <TouchableOpacity
                  disabled={!editable}
                  style={styles.dateInputContainer}
                  onPress={() => editable && setShowStartDate(true)}
                >
                  <TextInput
                    value={startDate ? startDate.toDateString() : ""}
                    editable={false}
                  />
                  <Ionicons name="calendar-outline" size={20} color="#6234E2" />
                </TouchableOpacity>
              )}
              {showStartDate && editable && (
                <DateTimePicker
                  value={startDate || new Date()}
                  mode="date"
                  onChange={(e, date) => {
                    setShowStartDate(false);
                    if (date) setStartDate(date);
                  }}
                />
              )}
            </View>

            {/* Actual Start */}
            <View style={styles.column}>
              <Text style={styles.label}>Actual Start Date</Text>
              {isView ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{endDate ? endDate.toDateString() : ""}</Text>
                </View>
              ) : (
                <TouchableOpacity
                  disabled={!editable}
                  style={styles.dateInputContainer}
                  onPress={() => editable && setShowEndDate(true)}
                >

                  <TextInput
                    value={endDate ? endDate.toDateString() : ""}
                    editable={false}
                  />
                  <Ionicons name="calendar-outline" size={20} color="#6234E2" />
                </TouchableOpacity>
              )}
              {showEndDate && editable && (
                <DateTimePicker
                  value={endDate || new Date()}
                  mode="date"
                  onChange={(e, date) => {
                    setShowEndDate(false);
                    if (date) setEndDate(date);
                  }}
                />
              )}
            </View>
          </View>

          <Text style={styles.label}>Special Terms</Text>
          {isView ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>{specialTerms || "-"}</Text>
            </View>
          ) : (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={specialTerms}
              onChangeText={setSpecialTerms}
              editable={editable}
              multiline
            />
          )}
        </View>

        <View style={styles.divider} />

        {/* ---------------- FINANCIAL ---------------- */}

        <Text style={styles.sectionHeader}>Financial Details</Text>

        <View style={styles.row}>

          {isView ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.label}>Discount (%)</Text>
              <Text style={styles.readOnlyText}>{discount || "-"}</Text>
            </View>
          ) : (
            <NumericInput
              label="Discount (%)"
              value={discount}
              onChange={setDiscount}
              editable={editable}
            />
          )}


          {isView ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.label}>Shipping & Handling</Text>
              <Text style={styles.readOnlyText}>{shipping || "-"}</Text>
            </View>
          ) : (
            <NumericInput
              label="Shipping & Handling"
              value={shipping}
              onChange={setShipping}
              editable={editable}
            />
          )}
        </View>

        <View style={styles.row}>

          {isView ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.label}>Tax</Text>
              <Text style={styles.readOnlyText}>{tax || "-"}</Text>
            </View>
          ) : (
            <NumericInput label="Tax" value={tax} onChange={setTax} editable={editable} />
          )}

          {isView ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.label}>Grand Total (₹)</Text>
              <Text style={styles.readOnlyText}>{grandTotal || "-"}</Text>
            </View>
          ) : (
            <NumericInput
              label="Grand Total (₹)"
              value={grandTotal}
              onChange={setGrandTotal}
              editable={editable}
            />
          )}
        </View>

        <View style={styles.divider} />

        {/* ---------------- ADDRESS ---------------- */}

        <Text style={styles.sectionHeader}>Address Information</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Billing Address</Text>

          <Text style={styles.label}>Street</Text>
          {isView ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>{billingStreet || "-"}</Text>
            </View>
          ) : (
            <TextInput
              style={styles.input}
              value={billingStreet}
              onChangeText={setBillingStreet}
              editable={editable}
              multiline
            />
          )}
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>City</Text>
              {isView ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{billingCity || "-"}</Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={billingCity}
                  onChangeText={setBillingCity}
                  editable={editable}
                />
              )}
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>Zip</Text>
              {isView ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{billingZip || "-"}</Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={billingZip}
                  onChangeText={setBillingZip}
                  editable={editable}
                />
              )}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>State</Text>
              {isView ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{billingState || "-"}</Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={billingState}
                  onChangeText={setBillingState}
                  editable={editable}
                />
              )}
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>Country</Text>
              {isView ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{billingCountry || "-"}</Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={billingCountry}
                  onChangeText={setBillingCountry}
                  editable={editable}
                />
              )}
            </View>
          </View>

          {/* ---------------- SHIPPING ---------------- */}

          <Text style={styles.label}>Shipping Address</Text>

          <Text style={styles.label}>Street</Text>
          {isView ? (
            <View style={styles.readOnlyView}>
              <Text style={styles.readOnlyText}>{shippingStreet || "-"}</Text>
            </View>
          ) : (
            <TextInput
              style={styles.input}
              value={shippingStreet}
              onChangeText={setShippingStreet}
              editable={editable}
              multiline
            />
          )}
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>City</Text>
              {isView ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{shippingCity || "-"}</Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={shippingCity}
                  onChangeText={setShippingCity}
                  editable={editable}
                />
              )}
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>Zip</Text>
              {isView ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{shippingZip || "-"}</Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={shippingZip}
                  onChangeText={setShippingZip}
                  editable={editable}
                />
              )}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>State</Text>
              {isView ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{shippingState || "-"}</Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={shippingState}
                  onChangeText={setShippingState}
                  editable={editable}
                />
              )}
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>Country</Text>
              {isView ? (
                <View style={styles.readOnlyView}>
                  <Text style={styles.readOnlyText}>{shippingCountry || "-"}</Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={shippingCountry}
                  onChangeText={setShippingCountry}
                  editable={editable}
                />
              )}
            </View>
          </View>
        </View>

        {/* ---------------- BUTTONS ---------------- */}

        <View style={styles.buttonContainer}>
          {isCreate && (
            <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
              <Text style={styles.buttonText}>Create Service Contract</Text>
            </TouchableOpacity>
          )}

          {isEdit && (
            <>
              <TouchableOpacity style={styles.createButton} onPress={handleUpdate}>
                <Text style={styles.buttonText}>Update Service Contract</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelButtons, { backgroundColor: "red" }]}
                onPress={handleDelete}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6234E2",
    marginVertical: 8,
  },
  section: { marginBottom: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },
  column: { flex: 1 },
  label: { fontSize: 14, color: "#6234E2", marginBottom: 6 },
  input: {
    backgroundColor: "#E5E5E5",
    borderColor: "#535351B2",
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  textArea: { height: 80 },
  dateInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E5E5E5",
    borderWidth: 0.5,
    borderColor: "#535351B2",
    borderRadius: 4,
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  buttonContainer: { marginVertical: 20 },
  createButton: {
    backgroundColor: "#6234E2",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "#535351",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  cancelButtons: {
    backgroundColor: "#535351",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 4,

  },
  buttonText: { color: "#fff", fontWeight: "600" },
  cancelText: { color: "#fff", fontWeight: "600" },
  readOnlyInput: {

    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 12,
    color: "#101318CC",

  },
  readOnlyView: {
    paddingVertical: 14,
    paddingHorizontal: 12,

  },
  readOnlyText: {
    fontSize: 12,
    color: "#101318CC",
  },

});
