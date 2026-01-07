import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import HeaderSection from "../../common/HeaderSection";
import Header from "../../common/Header";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { workCompletionService } from "@/src/api/auth";
import SwipeCard from "@/components/common/SwipeCard";



export default function WorkCompletion() {
  const [workData, setWorkData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");

  const navigation =
    useNavigation<NativeStackNavigationProp<SearchMenuStackParamList>>();

  useEffect(() => {
    const fetchWorkData = async () => {
      try {
        const data = await workCompletionService.getAll();
        setWorkData(data);
      } catch (err) {
        console.error("❌ Failed to fetch work completion statuses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return { backgroundColor: "#C8F7C5", color: "#0F9D58" };
      case "Pending Reviews":
        return { backgroundColor: "#FFE69A", color: "#7A5C00" };
      case "In Progress":
        return { backgroundColor: "#C9E4FF", color: "#1A73E8" };
      default:
        return { backgroundColor: "#EEE", color: "#555" };
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1A73E8" />
      </View>
    );
  }
  const filteredWorkData = workData.filter((item) => {
    const text = searchText.toLowerCase();

    return (
      item.work_order_title?.toLowerCase().includes(text) ||
      item.status?.toLowerCase().includes(text) ||
      item.verifier_first_name?.toLowerCase().includes(text) ||
      item.verifier_last_name?.toLowerCase().includes(text) ||
      item.work_order_id?.toLowerCase().includes(text)
    );
  });


  return (
    <View style={styles.wrapper}>
      <Header />
      <HeaderSection
        title="Work Completion Statuses"
        buttonText="+ New Status"
        onButtonClick={() =>
          navigation.navigate("WorkCompletionForm", { mode: "create" })
        }
        searchValue={searchText}
        onSearchChange={setSearchText}
      />



      <ScrollView style={styles.container}>
        <Text style={styles.sectionLabel}>FSM</Text>
        <Text style={styles.title}>Work Completion Statuses</Text>
        <Text style={styles.subtitle}>Track work order completion</Text>
        <Text style={styles.updateText}>
          {workData.length} statuses — Updated just now
        </Text>

        {filteredWorkData.length === 0 ? (
          <Text style={styles.noDataText}>
            No work completion records found.
          </Text>
        ) : (
          filteredWorkData.map((item, index) => {
            const colors = getStatusColor(item.status || "Unknown");

            return (
              <SwipeCard
                key={item.id ?? index}
                onEdit={() =>
                  navigation.navigate("WorkCompletionForm", {
                    mode: "edit",
                    workCompletion: item,
                  })
                }
                onView={() =>
                  navigation.navigate("WorkCompletionForm", {
                    mode: "view",
                    workCompletion: item,
                  })
                }
              >
                <View style={styles.card}>
                  {/* Row 1 */}
                  <View style={styles.row}>
                    <View style={styles.column}>
                      <Text style={styles.label}>Work Order</Text>
                      <Text style={styles.value}>
                        WO-
                        {item.work_order_id
                          ? item.work_order_id.slice(0, 8)
                          : "—"}{" "}
                        <Text style={styles.smallText}>
                          ({item.work_order_title || "—"})
                        </Text>
                      </Text>
                    </View>

                    <View style={styles.column}>
                      <Text style={styles.label}>Verified By</Text>
                      <Text style={styles.value}>
                        {item.verifier_first_name
                          ? `${item.verifier_first_name} ${item.verifier_last_name || ""}`
                          : "—"}
                      </Text>
                    </View>
                  </View>

                  {/* Row 2 */}
                  <View style={styles.row}>
                    <View style={styles.column}>
                      <Text style={styles.label}>Status</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: colors.backgroundColor },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: colors.color },
                          ]}
                        >
                          {item.status || "N/A"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.column}>
                      <Text style={styles.label}>Verified At</Text>
                      <Text style={styles.value}>
                        {item.verified_at
                          ? new Date(item.verified_at).toLocaleString()
                          : "—"}
                      </Text>
                    </View>
                  </View>
                </View>
              </SwipeCard>
            );
          })
        )}



      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 16,
  },
  sectionLabel: {
    color: "#6B4EFF",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginTop: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#535351CC",
    marginBottom: 2,
  },
  updateText: {
    fontSize: 10,
    color: "#999",
    marginBottom: 16,
  },
  noDataText: {
    textAlign: "center",
    color: "#999",
    fontSize: 13,
    marginTop: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    // ✅ Full border
    borderWidth: 1,
    borderColor: "#E0E0E0",

    // Shadow (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,

    // Shadow (Android)
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: "#6B4EFF",
    marginBottom: 4,
  },
  value: {
    fontSize: 12,
    fontWeight: "600",
    color: "#222",
  },
  smallText: {
    fontSize: 10,
    color: "#535351CC",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginTop: 4,
  },
  statusText: {
    fontWeight: "600",
    fontSize: 12,
  },
});
