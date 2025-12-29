import { Ionicons } from "@expo/vector-icons";
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

import { customerFeedbackService } from "@/src/api/auth";
import { searchWorkOrders, WorkOrderSearchResult } from "@/src/api/workorder";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import FormHeader from "../../common/FormHeader";

type RouteProps = RouteProp<SearchMenuStackParamList, "CreateCustomerFeedback">;

export default function CustomerFeedbackForm() {
  const navigation =
    useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();
  const route = useRoute<RouteProps>();

  const { mode = "create", feedback } = route.params || ({} as any);

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  // ---------------- State ----------------
  const [workOrderId, setWorkOrderId] = useState<string | null>(null);
  const [workOrderNumber, setWorkOrderNumber] = useState("");
  const [workOrderModal, setWorkOrderModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState("");
  const [agreePolicy, setAgreePolicy] = useState(false);

  const [workOrderQuery, setWorkOrderQuery] = useState("");
  const [workOrderResults, setWorkOrderResults] = useState<
    WorkOrderSearchResult[]
  >([]);
  const [showWorkOrderDropdown, setShowWorkOrderDropdown] = useState(false);
  const [loadingWorkOrders, setLoadingWorkOrders] = useState(false);

  // ---------------- Load Edit / View ----------------
  useEffect(() => {
    if (feedback && mode !== "create") {
      // Normalize work order ID
      const woid =
        typeof feedback.work_order_id === "object"
          ? feedback.work_order_id?.id
          : feedback.work_order_id;

      const wowork_order_number =
        feedback.work_order_number || feedback.work_order_id?.number || "";

      setWorkOrderId(woid); // ✅ UUID
      setWorkOrderNumber(wowork_order_number); // ✅ display
      setWorkOrderModal(false);
      setRating(feedback.rating);
      setComments(feedback.comments || "");
      setAgreePolicy(true);
    }
  }, [feedback]);


  

  // ---------------- Save ----------------
  const handleSubmit = async (resetAfter = false) => {
    if (!workOrderId) {
      return Alert.alert("Validation", "Work order is required");
    }

    if (typeof workOrderId !== "string") {
      return Alert.alert("Error", "Invalid work order selected");
    }

    if (!workOrderId || !workOrderNumber) {
      Alert.alert("Error", "Work order is required");
      return;
    }

    if (!workOrderNumber) {
      Alert.alert("Validation", "Work order number missing");
      return;
    }

    if (!agreePolicy) {
      return Alert.alert("Validation", "Please agree to feedback policy");
    }

    try {
      const payload = {
        //name: workOrderNumber,
        work_order_id: workOrderId, // ✅ MUST be id
        rating: Number(rating),
        comments: comments || null,
      };

      console.log("Submitting payload to customer feedback:", payload);

      console.log("API URL:", "/customer_feedback");


      if (isEditMode && feedback?.id) {
        await customerFeedbackService.update(feedback.id, payload);
        Alert.alert("Success", "Feedback updated");
        navigation.goBack();
        return;
      }

      await customerFeedbackService.create(payload);
      Alert.alert("Success", "Feedback submitted");

      if (resetAfter) {
        setWorkOrderId(null);
        setWorkOrderNumber("");
        setRating(5);
        setComments("");
        setAgreePolicy(false);
      } else {
        navigation.goBack();
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong");
    }
  };

  // ---------------- Rating Stars ----------------
  const renderStars = () => (
    <View>
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity
            key={i}
            disabled={isViewMode}
            onPress={() => setRating(i)}
          >
            <Ionicons
              name={i <= rating ? "star" : "star-outline"}
              size={22}
              color="#F59E0B"
            />
          </TouchableOpacity>
        ))}

        <Text style={styles.ratingText}>{rating}/5</Text>
      </View>

      {/* Blue underline like screenshot */}
      <View style={styles.ratingBar}>
        <View
          style={[styles.ratingFill, { width: `${(rating / 5) * 100}%` }]}
        />
      </View>
    </View>
  );

  // ---------------- Fetch Work Orders ----------------
  const fetchWorkOrders = async (query: string) => {
    setWorkOrderQuery(query);

    if (query.length < 2) {
      setShowWorkOrderDropdown(false);
      setWorkOrderResults([]);
      return;
    }
    setLoadingWorkOrders(true);

    const results = await searchWorkOrders(query);
    setWorkOrderResults(results);
    setShowWorkOrderDropdown(true);
    setLoadingWorkOrders(false);
  };

  const handleSelectWorkOrder = (wo: WorkOrderSearchResult) => {
    setWorkOrderId(wo.id); // ✅ send this to backend
    setWorkOrderNumber(wo.name); // ✅ show this in UI
    setShowWorkOrderDropdown(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FormHeader
        title={
          isCreateMode
            ? "Create Feedback"
            : isEditMode
            ? "Edit Feedback"
            : "View Feedback"
        }
        subtitle="Share your experience"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.headerRow}>
          <Text style={styles.subHeader}>FEEDBACK INFORMATION</Text>

          {isViewMode && (
            <TouchableOpacity
              style={styles.editSmallButton}
              onPress={() =>
                navigation.navigate("CreateCustomerFeedback", {
                  mode: "edit",
                  feedback,
                })
              }
            >
              <Ionicons name="create-outline" size={16} color="#fff" />
              <Text style={styles.editSmallButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Work Order */}
        <Text style={styles.label}>Work Order *</Text>

        {isViewMode ? (
          <View style={styles.readOnly}>
            <Text>{workOrderNumber || "-"}</Text>
          </View>
        ) : (
          <View>
            <View style={styles.searchInput}>
              <Ionicons name="search" size={18} color="#6B7280" />
              <TextInput
                style={{ flex: 1, marginLeft: 8 }}
                placeholder="Search work order"
                value={workOrderQuery}
                onChangeText={(text) => {
                  setWorkOrderQuery(text);
                  fetchWorkOrders(text);
                }}
              />
            </View>

            {/* Dropdown */}
            {showWorkOrderDropdown && (
              <View style={styles.dropdown}>
                {workOrderResults.map((wo) => (
                  <TouchableOpacity
                    key={wo.id}
                    style={styles.dropdownItem}
                    onPress={() => handleSelectWorkOrder(wo)}
                  >
                    <Text style={styles.dropdownItem}>{wo.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Rating */}
        <Text style={styles.label}>Rating *</Text>
        {renderStars()}

        {/* Comments */}
        <Text style={styles.label}>Comments</Text>
        {isViewMode ? (
          <View style={styles.readOnly}>
            <Text>{comments || "-"}</Text>
          </View>
        ) : (
          <TextInput
            style={styles.textArea}
            placeholder="Share your feedback..."
            multiline
            numberOfLines={4}
            value={comments}
            onChangeText={setComments}
          />
        )}

        {/* Policy */}
        {!isViewMode && (
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAgreePolicy(!agreePolicy)}
          >
            <Ionicons
              name={agreePolicy ? "checkbox" : "square-outline"}
              size={20}
              color="#2563EB"
            />
            <Text style={styles.checkboxText}>
              I agree to the feedback policy *
            </Text>
          </TouchableOpacity>
        )}

        {/* BUTTONS */}
        <View style={styles.buttonContainer}>
          {(isCreateMode || isEditMode) && (
            <>
              {/* Submit / Update */}
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => handleSubmit(false)}
              >
                <Text style={styles.buttonText}>
                  {isEditMode ? "Update" : "Submit"}
                </Text>
              </TouchableOpacity>

              {/* Save & New – only in Create */}
              {isCreateMode && (
                <TouchableOpacity
                  style={styles.saveNewButton}
                  onPress={() => handleSubmit(true)}
                >
                  <Text style={styles.buttonText}>Save & New</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Cancel – always visible */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: "#6234E2",
    fontSize: 14,
    marginTop: 14,
    marginBottom: 6,
    fontWeight: "600",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: "600",
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
  searchInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    padding: 10,
    borderRadius: 6,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  textArea: {
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    padding: 10,
    textAlignVertical: "top",
  },
  readOnly: {
    paddingVertical: 12,
  },
  starRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  ratingText: {
    marginLeft: 8,
    fontWeight: "600",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  checkboxText: {
    marginLeft: 8,
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: "#6234E2",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 20,
  },
  saveNewButton: {
    backgroundColor: "#16A34A",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: "#6234E2",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "#4B5563",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  ratingBar: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginTop: 6,
  },
  ratingFill: {
    height: 4,
    backgroundColor: "#2563EB",
    borderRadius: 4,
  },
  input: {
    backgroundColor: "#E5E5E5",
    borderWidth: 0.5,
    borderColor: "#535351B2",
    borderRadius: 4,
    height: 45,
    paddingHorizontal: 8,
  },
  readOnlyView: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  readOnlyText: {
    fontSize: 12,
    color: "#101318CC",
  },
  dropdown: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    marginTop: 4,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
});
