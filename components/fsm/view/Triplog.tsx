import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import Header from "../../common/Header";
import HeaderSection from "../../common/HeaderSection";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { api } from "@/src/api/cilent";


type Trip = {
  id: string;
  trip_id?: string;
  timestamp: string;
  latitude: string | number;
  longitude: string | number;
  note?: string;
  photo:string;
};

type NavigationProp = NativeStackNavigationProp<SearchMenuStackParamList, "TripLog">;

export default function TripLog() {
  const navigation = useNavigation<NavigationProp>();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const data = await api.get<Trip[]>("/trip_logs");
      setTrips(data);
    } catch (err) {
      console.error("Error fetching trip logs:", err);
      Alert.alert("Error", "Unable to fetch trip logs");
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchTrips();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />
      <HeaderSection
        title="What services do you need?"
        buttonText="+ New Logs"
        onButtonClick={() => navigation.navigate("TripLogForm", { mode: "create" })}
        onSearchChange={(text) => console.log("Searching:", text)}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTag}>FSM</Text>
          <Text style={styles.headerTitle}>Trip Logs</Text>
          <Text style={styles.headerMeta}>{trips.length} logs - Updated just now</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#6B4EFF" />
        ) : (
          trips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={styles.card}
              onPress={() =>
                navigation.navigate("TripLogForm", { mode: "view", data: trip })
              }
            >
              
              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Trip ID</Text>
                  <Text style={[styles.value, { textAlign: "left" }]} numberOfLines={1} ellipsizeMode="middle">
                    {trip.trip_id ?? "-"}

                  </Text>
                </View>

                <View style={{ flex: 1, alignItems: "flex-start" }}>
                  <Text style={styles.label}>Timestamp</Text>
                  <Text style={[styles.value, { textAlign: "right" }]}>{trip.timestamp}</Text>
                </View>
              </View>

              <View style={styles.rowBetween}>
                <View style={styles.thirdCol}>
                  <Text style={styles.smallLabel}>Latitude</Text>
                  <Text style={styles.smallValue}>{trip.latitude}</Text>
                </View>

                <View style={[styles.thirdCol, { alignItems: "flex-start" }]}>
                  <Text style={styles.smallLabel}>Longitude</Text>
                  <Text style={styles.smallValue}>{trip.longitude}</Text>
                </View>

                <View style={[styles.thirdCol, { alignItems: "flex-start" }]}>
                  <Text style={styles.smallLabel}>Note</Text>
                  <Text style={styles.smallValue}>{trip.note ?? "-"}</Text>
                </View>
              </View>


            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 21,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 0,
  },
  headerTag: {
    color: "#6B4EFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#101318",
  },
  headerMeta: {
    marginTop: 6,
    color: "#535351CC",
    fontSize: 10,

  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
    marginTop: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 50,
  },
  thirdCol: {
    flex: 1,
  },
  label: {
    color: "#6B4EFF",
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 4,
  },
  value: {
    color: "#111827",
    fontSize: 11,
    fontWeight: "700",
  },
  smallLabel: {
    color: "#6B4EFF",
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 4,
  },
  smallValue: {
    color: "#333",
    fontSize: 11,
    fontWeight: "600",
  },
});
