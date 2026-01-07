import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import AppNavigator from "./src/navigation/AppNavigator";
import { setupAutoSync } from "./database/sync";

export default function App() {
  useEffect(() => {
    console.log("✅ App started successfully!");
  }, []);

  useEffect(() => {
    setupAutoSync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
