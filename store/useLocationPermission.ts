import * as Location from "expo-location";

export const requestLocationPermission = async () => {
  // Request foreground location
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    console.warn("Foreground location permission denied");
    return false;
  }

  // Request background location (optional)
  const bg = await Location.requestBackgroundPermissionsAsync();
  if (bg.status !== "granted") {
    console.warn("Background location permission denied");
  }

  return true;
};
