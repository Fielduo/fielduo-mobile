import { api } from "@/src/api/cilent";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FormHeader from "../../common/FormHeader";

type CreateAccountRouteProp = RouteProp<
  SearchMenuStackParamList,
  "CreateAccount"
>;

export default function CreateAccountScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();
  const route = useRoute<CreateAccountRouteProp>();
  const { mode = "create", account } =
    route.params ||
    ({} as {
      mode: string;
      account?: any;
    });
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  // ---------------- States ----------------
  const [accountName, setAccountName] = useState("");
  const [status, setStatus] = useState("Active");
  const [type, setType] = useState("Partner");
  const [industry, setIndustry] = useState("IT");
  const [contractStatus, setContractStatus] = useState("Active");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [totalRevenue, setTotalRevenue] = useState("");
  const [customerRating, setCustomerRating] = useState("Hot");

  // ---------------- Load for Edit/View ----------------
  useEffect(() => {
    if (account && mode !== "create") {
      setAccountName(account.name);
      setStatus(account.status);
      setType(account.type);
      setIndustry(account.industry);
      setContractStatus(account.contract_status);
      setPaymentTerms(account.payment_terms || "");
      setCreditLimit(account.credit_limit || "");
      setTotalRevenue(account.total_revenue || "");
      setCustomerRating(account.customer_rating);
    }
  }, [account]);

  // ---------------- Save ----------------
  const handleSave = async () => {
    if (!accountName) {
      return Alert.alert("Validation Error", "Account Name is required");
    }

    try {
      const payload = {
        name: accountName,
        status,
        type,
        industry,
        contract_status: contractStatus,
        payment_terms: paymentTerms,
        credit_limit: creditLimit,
        total_revenue: totalRevenue,
        customer_rating: customerRating,
      };

      if (isEditMode && account?.id) {
        await api.put(`/accounts/${account.id}`, payload);
        Alert.alert("Success", "Account updated successfully");
        navigation.goBack();
        return;
      } else {
        await api.post("/accounts", payload);
        Alert.alert("Success", "Account saved successfully");
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FormHeader
        title={
          isCreateMode
            ? "Create Account"
            : isEditMode
            ? "Edit Account"
            : "View Account"
        }
        subtitle="Add a new account to your organization"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={{ padding: 16 }}>
        {/* HEADER ROW */}
        <View style={styles.headerRow}>
          <Text style={styles.subHeader}>ACCOUNT INFORMATION</Text>

          {isViewMode && (
            <TouchableOpacity
              style={styles.editSmallButton}
              onPress={() =>
                navigation.navigate("CreateAccount", {
                  mode: "edit",
                  account, // pass same account
                })
              }
            >
              <Ionicons name="create-outline" size={16} color="#fff" />
              <Text style={styles.editSmallButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.errorText}>Account Name is Required</Text>

        {/* Account Name */}
        <Text style={styles.label}>Account Name *</Text>
        {isViewMode ? (
          <View style={styles.readOnlyView}>
            <Text style={styles.readOnlyText}>{accountName || "-"}</Text>
          </View>
        ) : (
          <TextInput
            style={styles.input}
            value={accountName}
            editable={!isViewMode}
            onChangeText={setAccountName}
          />
        )}

        {/* Status */}
        <Text style={styles.label}>Status</Text>
        {isViewMode ? (
          <View style={styles.readOnlyView}>
            <Text style={styles.readOnlyText}>{status}</Text>
          </View>
        ) : (
          <View style={styles.pickerContainer}>
            <Picker selectedValue={status} onValueChange={setStatus}>
              <Picker.Item label="Active" value="Active" />
              <Picker.Item label="Inactive" value="Inactive" />
            </Picker>
          </View>
        )}

        {/* Type */}
        <Text style={styles.label}>Type</Text>
        {isViewMode ? (
          <View style={styles.readOnlyView}>
            <Text style={styles.readOnlyText}>{type}</Text>
          </View>
        ) : (
          <View style={styles.pickerContainer}>
            <Picker selectedValue={type} onValueChange={setType}>
              <Picker.Item label="Partner" value="Partner" />
              <Picker.Item label="Customer" value="Customer" />
            </Picker>
          </View>
        )}

        {/* Industry */}
        <Text style={styles.label}>Industry</Text>
        {isViewMode ? (
          <View style={styles.readOnlyView}>
            <Text style={styles.readOnlyText}>{industry}</Text>
          </View>
        ) : (
          <View style={styles.pickerContainer}>
            <Picker selectedValue={industry} onValueChange={setIndustry}>
              <Picker.Item label="IT" value="IT" />
              <Picker.Item label="Manufacturing" value="Manufacturing" />
            </Picker>
          </View>
        )}

        {/* Contract Status */}
        <Text style={styles.label}>Contract Status</Text>
        {isViewMode ? (
          <View style={styles.readOnlyView}>
            <Text style={styles.readOnlyText}>{contractStatus}</Text>
          </View>
        ) : (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={contractStatus}
              onValueChange={setContractStatus}
            >
              <Picker.Item label="Active" value="Active" />
              <Picker.Item label="Expired" value="Expired" />
            </Picker>
          </View>
        )}

        {/* Payment Terms */}
        <Text style={styles.label}>Payment Terms</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g Net 30,Net 60"
          value={paymentTerms}
          editable={!isViewMode}
          onChangeText={setPaymentTerms}
        />

        {/* Credit Limit */}
        <Text style={styles.label}>Credit Limit (₹)</Text>
        <TextInput
          style={styles.input}
          placeholder="Credit Limit"
          keyboardType="numeric"
          value={creditLimit}
          editable={!isViewMode}
          onChangeText={setCreditLimit}
        />

        {/* Total Revenue */}
        <Text style={styles.label}>Total Revenue (₹)</Text>
        <TextInput
          style={styles.input}
          placeholder="Total Revenue"
          keyboardType="numeric"
          value={totalRevenue}
          editable={!isViewMode}
          onChangeText={setTotalRevenue}
        />

        {/* Customer Rating */}
        <Text style={styles.label}>Customer Rating</Text>
        {isViewMode ? (
          <View style={styles.readOnlyView}>
            <Text style={styles.readOnlyText}>{customerRating}</Text>
          </View>
        ) : (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={customerRating}
              onValueChange={setCustomerRating}
            >
              <Picker.Item label="Hot" value="Hot" />
              <Picker.Item label="Warm" value="Warm" />
              <Picker.Item label="Cold" value="Cold" />
            </Picker>
          </View>
        )}

        {/* BUTTONS */}
        <View style={styles.buttonContainer}>
          {(isCreateMode || isEditMode) && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>
                {isCreateMode ? "Save" : "Update"}
              </Text>
            </TouchableOpacity>
          )}

          {isViewMode && (
            <TouchableOpacity style={styles.cancelButton}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  subHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: "#6234E2",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#E5E5E5",
    borderWidth: 0.5,
    borderColor: "#535351B2",
    borderRadius: 4,
    height: 45,
    paddingHorizontal: 8,
  },
  pickerContainer: {
    backgroundColor: "#E5E5E5",
    borderWidth: 0.5,
    borderColor: "#535351B2",
    borderRadius: 4,
    height: 45,
    justifyContent: "center",
  },
  readOnlyView: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  readOnlyText: {
    fontSize: 12,
    color: "#101318CC",
  },
  errorText: {
    color: "red",
    fontSize: 12,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  saveButton: {
    backgroundColor: "#6234E2",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "#535351B2",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
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
