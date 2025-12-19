import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import HeaderSection from "../../common/HeaderSection";
import Header from "../../common/Header";
import { api } from "@/src/api/cilent";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import FilterModal, { AppliedFilter } from "@/components/common/FilterModal";
import { Ionicons } from "@expo/vector-icons";


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
  const [filterVisible, setFilterVisible] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState<AppliedFilter | null>(null);
const [dropdownOpen, setDropdownOpen] = useState(false);
const [viewMode, setViewMode] = useState<'all' | 'recent'>('all');
const [recentReportIds, setRecentReportIds] = useState<string[]>([]);

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
const displayedReports = reports
  .filter((report) => {
    // filter by applied filter
    if (!appliedFilter || !appliedFilter.field) return true;
    const rawValue = report[appliedFilter.field as keyof ServiceReportItem];
    if (!rawValue) return false;
    return rawValue.toString().toLowerCase().includes(appliedFilter.value.toLowerCase());
  })
  .filter((report) => {
    // filter by view mode
    if (viewMode === 'all') return true;
    return recentReportIds.includes(report.id);
  });


  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <Header />

      <HeaderSection
        title="What services do you need?"
        buttonText="+ New Reports"
        onButtonClick={() => navigation.navigate("ServiceReportForm", { mode: "create" })}
        onSearchPress={() => setFilterVisible(true)} // open filter modal
      />

      <View style={styles.headerRow}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTag}>FSM</Text>
          <Text style={styles.title}>Service Reports</Text>
          <Text style={styles.subtitle}>Field Service Documentation</Text>
          <Text style={styles.metaText}>
            {reportCount} {reportCount === 1 ? "report" : "reports"} - Updated just now
          </Text>
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
          {displayedReports.map((item: ServiceReportItem, index: number) => (

            <TouchableOpacity
              key={index}
              style={styles.row}
              onPress={() => {
  navigation.navigate("ServiceReportForm", {
    mode: "view",
    report: item,
  });

  // Update recent reports
  setRecentReportIds((prev) => {
    const newList = [item.id, ...prev.filter(id => id !== item.id)];
    return newList.slice(0, 10); // keep last 10
  });
}}

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
        <FilterModal
          visible={filterVisible}
          module="service_contract" // or "work_orders" or any suitable module for service reports
          onClose={() => setFilterVisible(false)}
          onApply={(filter) => {
            setAppliedFilter(filter);
            setFilterVisible(false);
          }}
        />

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
