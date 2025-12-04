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
// import { SearchMenuStackParamList } from "../../navigation/StackNavigator.tsx/SearchmenuNavigator";
import Header from "../common/Header";
import HeaderSection from "../common/HeaderSection";
import { useAuthStore } from "../../store/useAuthStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/src/api/cilent";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// type SearchMenuNavigationProp = NativeStackNavigationProp<SearchMenuStackParamList>;
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
    title: "REPORT AND ANALYSIS",
    items: [
      { name: "Dashboard", icon: "view-dashboard-outline", route: "DashboardScreen" },
      { name: "Field Management", icon: "map-marker-outline", route: "FieldManagement" },
      { name: "IOT", icon: "chip", route: "IOT" },
    ],
  },
  {
    title: "CRM",
    items: [
      { name: "Account", icon: "account-outline", route: "Account" },
      { name: "Contact", icon: "account-multiple-outline", route: "Contact" },
      { name: "Leads", icon: "lightbulb-outline", route: "Leads" },
      { name: "Opportunities", icon: "chart-line", route: "Opportunities" },
    ],
  },
  {
    title: "FSM",
    items: [
      { name: "Technicians", icon: "account-plus-outline", route: "WorkForce" },
      { name: "Assets", icon: "cube-outline", route: "Assets" },
      { name: "New Service Contract", icon: "file-document-edit-outline", route: "ServiceContract" },
      { name: "Work Order", icon: "clipboard-list-outline", route: "Workorder" },
      { name: "Inventory", icon: "package-variant-closed", route: "Inventory" },
      { name: "Job Schedule", icon: "calendar-clock", route: "Schedule" },
      { name: "Job Assign", icon: "map-marker-distance", route: "FieldWorkerTrip" },
      { name: "Vehicle", icon: "car-outline", route: "Vehicles" },
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
  // const navigation = useNavigation<SearchMenuNavigationProp>();
  const setUser = useAuthStore((state) => state.setUser);
  const currentUser = useAuthStore((state) => state.user); // ✅ get current user

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("authToken");
            await api.clearToken(); // clear Axios token
            setUser(null); // reset Zustand user

            // navigation.reset({
            //   index: 0,
            //   routes: [{ name: "Login" as never }],
            // });
          } catch (error) {
            console.error("Error logging out:", error);
            Alert.alert("Error", "Failed to log out. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF" }}>
      <Header />
      <HeaderSection
        title="What services do you need?"
        buttonText="+ New Field"
        onButtonClick={() => console.log("New Field Clicked")}
        onSearchChange={(text) => console.log("Searching:", text)}
        currentScreen="SearchMenu"
      />

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
                  // onPress={() => navigation.navigate(item.route as never)}
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

          <View style={styles.footer}>
            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons
                name="cog-outline"
                size={22}
                color="#6B6B6B"
                style={styles.menuIcon}
              />
              <Text style={styles.menuText}>Settings</Text>
            </TouchableOpacity>

            <View style={styles.userSection}>
              <View style={styles.userAvatar}>
                <Text style={styles.userInitial}>
                  {currentUser?.first_name?.[0] || "U"}
                </Text>
              </View>
              <View>
                <Text style={styles.userName}>{currentUser?.first_name || "User"}</Text>
                <Text style={styles.userEmail}>{currentUser?.email || "email@example.com"}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogout}
              style={[styles.menuItem, { marginTop: 10 }]}
            >
              <MaterialCommunityIcons
                name="logout"
                size={22}
                color="#D32F2F"
                style={styles.menuIcon}
              />
              <Text style={[styles.menuText, { color: "#D32F2F" }]}>Logout</Text>
            </TouchableOpacity>
          </View>
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
  footer: { borderTopWidth: 1, borderTopColor: "#E0E0E0", paddingTop: 16, marginTop: 10 },
  userSection: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  userAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#EDE7F6", alignItems: "center", justifyContent: "center", marginRight: 10 },
  userInitial: { color: "#7E57C2", fontWeight: "700" },
  userName: { fontSize: 13, fontWeight: "600", color: "#212121" },
  userEmail: { fontSize: 11, color: "#757575" },
});
