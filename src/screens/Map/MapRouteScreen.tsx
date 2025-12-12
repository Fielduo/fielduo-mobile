import React from "react";
import { View } from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { SearchMenuStackParamList } from "@/src/navigation/StackNavigator/SearchmenuNavigator";
import { Job, JobSchedule } from "@/types/Worker";
import MapRoute from "@/components/MapRoute";


export default function MapRouteScreen() {
  const route = useRoute<RouteProp<SearchMenuStackParamList, "MapRouteScreen">>();
  const navigation = useNavigation();

  console.log("📌 Route Params Received:", route.params);

  const events: JobSchedule[] = route.params.jobs;
  const selectedDate: string = route.params.selectedDate;
  const assignedUserId: string = route.params.assignedUserId;

  console.log("🗂 Jobs Received:", events);
  console.log("📅 Selected Date:", selectedDate);
  console.log("👤 Assigned User ID:", assignedUserId);

  const jobs: Job[] = events.map((e) => ({
    id: e.id ?? "",
    work_order_title: e.work_order_title || "Untitled",
    schedule_status: e.schedule_status || "Scheduled",
    latitude: Number(e.latitude) || 0,
    longitude: Number(e.longitude) || 0,
    route_order: e.route_order,
    assigned_to_name: e.assigned_to_name || "",
  }));

  console.log("🗺 Parsed Jobs for Map:", jobs);

  return (
    <View style={{ flex: 1 }}>
      <MapRoute
        jobs={jobs}
        assignedUserId={assignedUserId}

        selectedDate={selectedDate}
        onClose={() => navigation.goBack()}

      />
    </View>
  );
}
