import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../common/Header";

type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: "job" | "urgent" | "cancelled";
  created_at: string;
  read: boolean;
};

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    // 🔁 later replace with API
    setNotifications([
      {
        id: "1",
        title: "🚨 Urgent Job Assigned",
        message: "Immediate action required (SLA critical)",
        type: "urgent",
        created_at: "Just now",
        read: false,
      },
      {
        id: "2",
        title: "New Job Assigned",
        message: "Check job details in schedule",
        type: "job",
        created_at: "10 mins ago",
        read: true,
      },
      {
        id: "3",
        title: "Job Cancelled",
        message: "Work order has been cancelled",
        type: "cancelled",
        created_at: "Yesterday",
        read: true,
      },
    ]);
  }, []);

  const renderItem = ({ item }: { item: AppNotification }) => (
    <TouchableOpacity
      style={[
        styles.card,
        !item.read && styles.unread,
        item.type === "urgent" && styles.urgent,
      ]}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.time}>{item.created_at}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header />
      <Text style={styles.header}>Notifications</Text>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No notifications</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", padding: 16 },
  header: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  card: {
    backgroundColor: "#F5F5F5",
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  unread: {
    backgroundColor: "#EDE7FF",
  },
  urgent: {
    borderLeftWidth: 4,
    borderLeftColor: "#E53935",
  },
  title: { fontWeight: "600", fontSize: 14 },
  message: { fontSize: 13, marginTop: 4 },
  time: { fontSize: 11, color: "#666", marginTop: 6 },
  empty: { textAlign: "center", marginTop: 40, color: "#999" },
});
