import { 
  requestForegroundPermissionsAsync,
  requestBackgroundPermissionsAsync,
  getCurrentPositionAsync,
  watchPositionAsync,
  Accuracy,

} from 'expo-location';
import { getDistance } from 'geolib';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { api } from '@/src/api/cilent';

type LocationObject = {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number | null;
    altitude: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
};

export interface MyLocation {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    speed?: number;
    altitude?: number;
    heading?: number;
  };
  timestamp: number;
}

interface TrackerConfig {
  STATIONARY_THRESHOLD: number;
  MIN_DISTANCE_FILTER: number;
  TRACKING_INTERVALS: {
    STATIONARY: number;
    SLOW_MOVING: number;
    MOVING: number;
    HIGH_SPEED: number;
  };
}

class LocationTracker {
  private config: TrackerConfig = {
    STATIONARY_THRESHOLD: 10,
    MIN_DISTANCE_FILTER: 50,
    TRACKING_INTERVALS: {
      STATIONARY: 5 * 60 * 1000,
      SLOW_MOVING: 2 * 60 * 1000,
      MOVING: 30 * 1000,
      HIGH_SPEED: 10 * 1000,
    },
  };

  private lastLocation: MyLocation | null = null;
  private subscription: { remove: () => void } | null = null;

  onLocationUpdate: ((loc: MyLocation) => void) | null = null;

  private determineTrackingMode(loc: MyLocation) {
    const speed = loc.coords.speed || 0;
    if (speed === 0) return 'STATIONARY';
    if (speed < 10) return 'SLOW_MOVING';
    if (speed < 50) return 'MOVING';
    return 'HIGH_SPEED';
  }

  private isSignificantUpdate(newLoc: MyLocation) {
    if (!this.lastLocation) return true;

    const distance = getDistance(
      {
        latitude: this.lastLocation.coords.latitude,
        longitude: this.lastLocation.coords.longitude,
      },
      {
        latitude: newLoc.coords.latitude,
        longitude: newLoc.coords.longitude,
      }
    );

    return distance >= this.config.MIN_DISTANCE_FILTER;
  }

  private async sendToBackend(loc: MyLocation) {
    try {
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        console.log("No network, skipping send");
        return;
      }

      console.log("Sending location:", loc);
      const res = await api.post("/technician-locations/track", {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        speed: loc.coords.speed || 0,
        accuracy: loc.coords.accuracy,
      });
      console.log("Server response:", res);
    } catch (err) {
      console.log("Failed sending location:", err);
    }
  }

async start() {
  const { status } = await requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.log("Foreground location permission denied");
    return;
  }

  if (Platform.OS === 'android') {
    await requestBackgroundPermissionsAsync();
  }

  const subscription = await watchPositionAsync(
    {
      accuracy: Accuracy.High,
      timeInterval: this.config.TRACKING_INTERVALS.MOVING,
      distanceInterval: this.config.MIN_DISTANCE_FILTER,
    },
    async (loc: LocationObject) => {
      // Convert nullable fields to non-null
      const myLoc: MyLocation = {
        coords: {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          accuracy: loc.coords.accuracy ?? 0,  // fallback if null
          speed: loc.coords.speed ?? 0,        // fallback if null
          altitude: loc.coords.altitude ?? 0,
          heading: loc.coords.heading ?? 0,
        },
        timestamp: loc.timestamp,
      };

      if (this.isSignificantUpdate(myLoc)) {
        await this.sendToBackend(myLoc);
        this.lastLocation = myLoc;
        this.onLocationUpdate?.(myLoc);
      }
    }
  );

  this.subscription = { remove: () => subscription.remove() };
}


  stop() {
    this.subscription?.remove();
    this.subscription = null;
  }
}

export default new LocationTracker();
