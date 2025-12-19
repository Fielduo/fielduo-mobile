import {
  requestForegroundPermissionsAsync,
  watchPositionAsync,
  Accuracy,
} from 'expo-location';
import NetInfo from '@react-native-community/netinfo';
import { api } from '@/src/api/cilent';
import { getDistance } from 'geolib';

export interface MyLocation {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    speed?: number;
  };
  timestamp: number;
}

class LocationTracker {
  private lastLocation: MyLocation | null = null;
  private subscription: { remove: () => void } | null = null;

  onLocationUpdate: ((loc: MyLocation) => void) | null = null;

  private isSignificant(newLoc: MyLocation) {
    if (!this.lastLocation) return true;

    const dist = getDistance(
      {
        latitude: this.lastLocation.coords.latitude,
        longitude: this.lastLocation.coords.longitude,
      },
      {
        latitude: newLoc.coords.latitude,
        longitude: newLoc.coords.longitude,
      }
    );

   
    return dist >= 10;
  }

  private async sendToBackend(loc: MyLocation) {
    const net = await NetInfo.fetch();

    if (!net.isConnected) {
     
      return;
    }

    

    try {
      await api.post('/technician-locations/track', {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
        speed: loc.coords.speed ?? 0,
      });

     
    } catch (e) {
     
    }
  }

  async start() {
    
    const { status } = await requestForegroundPermissionsAsync();


    if (status !== 'granted') {
    
      return;
    }

    this.subscription = await watchPositionAsync(
      {
        accuracy: Accuracy.High,
        timeInterval: 9000,   // 🔥 every 3 sec
        distanceInterval: 0,  // 🔥 even same location
      },
      async (loc) => {
        

        const myLoc: MyLocation = {
          coords: {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracy: loc.coords.accuracy ?? 0,
            speed: loc.coords.speed ?? 0,
          },
          timestamp: loc.timestamp,
        };

        if (this.isSignificant(myLoc)) {
         
          this.lastLocation = myLoc;
          this.onLocationUpdate?.(myLoc);
        }

        await this.sendToBackend(myLoc);
      }
    );
  }

  stop() {
  
    this.subscription?.remove();
    this.subscription = null;
    this.lastLocation = null;
  }
}

export default new LocationTracker();
