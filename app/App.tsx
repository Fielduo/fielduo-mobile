import React, { useEffect } from "react";
import AppNavigator from "./navigation/AppNavigator";

export default function App() {
  useEffect(() => {
    console.log("✅ App started successfully!");
  }, []);

  return <AppNavigator />; // ✅ no NavigationContainer here
}
