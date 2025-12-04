// import React from "react";
// import { View } from "react-native";
// import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
// import RouteMap from "../../components/MapRoute";
// import { SearchMenuStackParamList } from "../../navigation/StackNavigator.tsx/SearchmenuNavigator";

// export default function MapRouteScreen() {
//   const route = useRoute<RouteProp<SearchMenuStackParamList, "MapRouteScreen">>();
//   const navigation = useNavigation();

//   console.log("📌 Route Params Received:", route.params);

//   const events: JobSchedule[] = route.params.jobs;
//   const selectedDate: string = route.params.selectedDate;
//   const assignedUserId: string = route.params.assignedUserId;

//   console.log("🗂 Jobs Received:", events);
//   console.log("📅 Selected Date:", selectedDate);
//   console.log("👤 Assigned User ID:", assignedUserId);

//   const jobs: Job[] = events.map((e) => ({
//     id: e.id ?? "",
//     work_order_title: e.work_order_title || "Untitled",
//     schedule_status: e.schedule_status || "Scheduled",
//     latitude: Number(e.latitude) || 0,
//     longitude: Number(e.longitude) || 0,
//     route_order: e.route_order,
//   }));

//   console.log("🗺 Parsed Jobs for Map:", jobs);

//   return (
//     <View style={{ flex: 1 }}>
//       <RouteMap
//         jobs={jobs}
//         assignedUserId={assignedUserId}

//         selectedDate={selectedDate}
//         onClose={() => navigation.goBack()}

//       />
//     </View>
//   );
// }
