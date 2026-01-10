// src/navigation/RootNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppNavigator from "./AppNavigator";
import NotificationScreen from "@/components/report-analysis/NotificationScreen";

export type RootStackParamList = {
  AppStack: undefined;       // contains AuthStack or MainTabs
  Notifications: undefined;  // global Notifications screen
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <RootStack.Navigator id="root" screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="AppStack" component={AppNavigator} />
      <RootStack.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{ presentation: "modal" }} // optional nice slide-up effect
      />
    </RootStack.Navigator>
  );
}
