import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert  } from "react-native";
import {  useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import HeaderSection from "../../common/HeaderSection";
import Header from "../../common/Header";
import { api } from "@/src/api/cilent";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";


type NavigationProp = NativeStackNavigationProp<SearchMenuStackParamList>;

interface ServiceReportItem {
  id: string;
  work_order_id: string;
  report_text: string;
  report_file_url: string;
  submitted_by: string;
  submitted_at: string;
  work_order_number?: string;
  work_order_title?: string;
  submitter_first_name?: string;
  submitter_last_name?: string;
}

export default function ServiceReport() {
  const navigation = useNavigation<NavigationProp>();

  const [reports, setReports] = useState<ServiceReportItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await api.get<ServiceReportItem[]>("/service_reports"); // fetch from backend
      setReports(data);
    } catch (err: any) {
      console.error("❌ Error fetching reports:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch service reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  

  const reportCount = reports.length;

    return (
        <View style={{ flex: 1, backgroundColor: "#FFF" }}>
            <Header />

            <HeaderSection
                title="What services do you need?"
                buttonText="+ New Reports"
                onButtonClick={() => navigation.navigate("ServiceReportForm", { mode: "create" })}
                onSearchChange={(text) => console.log("Searching:", text)}
            />

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTag}>FSM</Text>
                <Text style={styles.title}>Service Reports</Text>
                <Text style={styles.subtitle}>Field Service Documentation</Text>
                <Text style={styles.metaText}>
                    {reportCount} {reportCount === 1 ? "report" : "reports"} - Updated just now
                </Text>
            </View>

            <ScrollView style={styles.container}>
                <View style={styles.tableWrapper}>
                    {/* Table Header */}
                    <View style={styles.row}>
                        <Text style={[styles.cell, styles.headerText]}>Work Order</Text>
                        <Text style={[styles.cell, styles.headerText]}>Submitted By</Text>
                        <Text style={[styles.cell, styles.headerText]}>Submitted At</Text>
                        <Text style={[styles.cell, styles.headerText]}>Has File</Text>
                    </View>

                    {/* Table Rows */}
                   {reports.map((item: ServiceReportItem, index: number) => (
  <TouchableOpacity
    key={index}
    style={styles.row}
    onPress={() =>
      navigation.navigate("ServiceReportForm", {
        mode: "view",
        report: item,
      })
    }
  >
                           <View style={styles.cell}>
      <Text style={styles.boldText}>{item.work_order_number || item.work_order_id}</Text>
      <Text style={styles.subText}>{item.work_order_title}</Text>
    </View>
    <Text style={[styles.cell, styles.boldText]}>
      {item.submitter_first_name} {item.submitter_last_name}
    </Text>
    <Text style={styles.cell}>{new Date(item.submitted_at).toLocaleString()}</Text>
    <View style={[styles.cell, styles.center]}>
      <View
        style={[
          styles.badge,
          {
            backgroundColor: item.report_file_url ? "#E8F4FF" : "#FDECEC",
            borderColor: item.report_file_url ? "#009587" : "#FF3B30",
            borderWidth: 1.2,
          },
        ]}
      >
        <Text
          style={{
            color: item.report_file_url ? "#009587" : "#FF3B30",
            fontWeight: "600",
            fontSize: 12,
          }}
        >
          {item.report_file_url ? "Yes" : "No"}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
))}
                </View>
            </ScrollView>
        </View>
    );
}


const styles = StyleSheet.create({
    sectionHeader: {
        paddingHorizontal: 16,
        paddingTop: 10,
        backgroundColor: "#FFF",
    },
    sectionTag: {
        color: "#6B4EFF",
        fontWeight: "700",
        fontSize: 12,
        textTransform: "uppercase",
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#101318",
    },
    subtitle: {
        color: "#555",
        fontSize: 13,
        marginTop: 2,
    },
    metaText: {
        color: "#888",
        fontSize: 12,
        marginTop: 2,
        marginBottom: 4,
    },
    container: {
        flex: 1,
        backgroundColor: "#FFF",
        padding: 16,
    },
    tableWrapper: {
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#D9D9D9",
        borderRadius: 6,
        overflow: "hidden",
        elevation: 3,
    },
    row: {
        flexDirection: "row",
    },
    cell: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderWidth: 1,            // 👈 Add this to give border on all sides
        borderColor: "#D9D9D9",    // 👈 Soft grey border color
    },
    headerText: {
        fontWeight: "700",
        fontSize: 10,
        color: "#6B4EFF",
        backgroundColor: "#FAFAFC",
        textAlign: "center",
    },
    boldText: {
        fontWeight: "600",
        color: "#222",
        fontSize: 11,
        textAlign: "center",
    },
    subText: {
        fontSize: 10,
        color: "#666",
        textAlign: "center",
    },
    center: {
        alignItems: "center",
        justifyContent: "center",
    },
    badge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
});
