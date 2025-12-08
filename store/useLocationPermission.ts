import { PermissionsAndroid, Platform } from "react-native";
import Geolocation from "react-native-geolocation-service";

export const requestLocationPermission = async () => {
  if (Platform.OS === "ios") {
    return await Geolocation.requestAuthorization("always");
  }

  if (Platform.OS === "android") {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "This app needs access to your location.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
};
