import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Pressable,
  Alert,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Header from "../common/Header";
import HeaderSection from "../common/HeaderSection";
import { useAuthStore } from "../../store/useAuthStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/src/api/cilent";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";

type SearchMenuNavigationProp = NativeStackNavigationProp<SearchMenuStackParamList>;
type MenuIconName =
  | "view-dashboard-outline"
  | "map-marker-outline"
  | "chip"
  | "account-outline"
  | "account-multiple-outline"
  | "lightbulb-outline"
  | "chart-line"
  | "account-plus-outline"
  | "cube-outline"
  | "file-document-edit-outline"
  | "clipboard-list-outline"
  | "package-variant-closed"
  | "calendar-clock"
  | "map-marker-distance"
  | "car-outline"
  | "clipboard-check-outline"
  | "file-document-outline"
  | "file-chart-outline"
  | "file-cabinet"
  | "file-document"
  | "comment-text-outline"
  | "credit-card-outline";

const menuSections: {
  title: string;
  items: { name: string; icon: MenuIconName; route: string }[];
}[] = [
    {
      title: "DASHBOARD",
      items: [
        { name: "Dashboard", icon: "view-dashboard-outline", route: "DashboardScreen" },
        // { name: "Field Management", icon: "map-marker-outline", route: "FieldManagement" },
        // { name: "IOT", icon: "chip", route: "IOT" },
      ],
    },
    // {
    //   title: "CRM",
    //   items: [
    //     { name: "Account", icon: "account-outline", route: "Account" },
    //     { name: "Contact", icon: "account-multiple-outline", route: "Contact" },
    //     // { name: "Leads", icon: "lightbulb-outline", route: "Leads" },
    //     // { name: "Opportunities", icon: "chart-line", route: "Opportunities" },
    //   ],
    // },
    {
      title: "FSM",
      items: [
        { name: "Account", icon: "account-outline", route: "Account" },
        { name: "Contact", icon: "account-multiple-outline", route: "Contact" },
        { name: "Technicians", icon: "account-plus-outline", route: "WorkForce" },
        { name: "Assets", icon: "cube-outline", route: "Assets" },
        { name: "Inventory", icon: "package-variant-closed", route: "Inventory" },
        { name: "Fleet", icon: "car-outline", route: "Vehicles" },
        { name: "New Service Contract", icon: "file-document-edit-outline", route: "ServiceContract" },
        { name: "Work Order", icon: "clipboard-list-outline", route: "Workorder" },

        { name: "Job Schedule", icon: "calendar-clock", route: "Schedule" },
        { name: "Job Assignment", icon: "map-marker-distance", route: "FieldWorkerTrip" },

        { name: "Work Complete Status", icon: "clipboard-check-outline", route: "WorkCompletion" },
        { name: "Service Report", icon: "file-document-outline", route: "ServiceReport" },
        { name: "Trips Logs", icon: "file-chart-outline", route: "TripLog" },
      ],
    },
    {
      title: "BILLING",
      items: [
        { name: "Quotes", icon: "file-cabinet", route: "Quotes" },
        { name: "Invoice", icon: "file-document", route: "Invoices" },
        { name: "Customer Feedback", icon: "comment-text-outline", route: "CustomerFeedback" },
        { name: "Payment", icon: "credit-card-outline", route: "Payments" },
      ],
    },
  ];

export default function SearchMenu() {
  const navigation = useNavigation<SearchMenuNavigationProp>();

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <Header />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          {menuSections.map((section, i) => (
            <View key={i} style={styles.section}>
              {i !== 0 && <View style={styles.sectionDivider} />}
              <Text style={styles.sectionTitle}>{section.title}</Text>

              {section.items.map((item, index) => (
                <Pressable
                  key={index}
                  onPress={() => navigation.navigate(item.route as never)}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && styles.menuItemPressed,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={22}
                    color="#6B6B6B"
                    style={styles.menuIcon}
                  />
                  <Text style={styles.menuText}>{item.name}</Text>
                </Pressable>
              ))}
            </View>
          ))}

         
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#fff", paddingVertical: 20, paddingHorizontal: 16 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: "#6234E2", marginBottom: 8 },
  sectionDivider: { height: 1, backgroundColor: "#5353514D", marginBottom: 6, borderRadius: 1 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 9, paddingHorizontal: 14, borderRadius: 8, marginBottom: 6 },
  menuItemPressed: { backgroundColor: "#F1F1F1" },
  menuIcon: { marginRight: 14 },
  menuText: { fontSize: 15, fontWeight: "500", color: "#3A3A3A" },
  
});
