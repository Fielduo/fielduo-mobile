import * as Location from 'expo-location';
import { LOCATION_TASK } from './locationTask';


class BackgroundTracker {
  async start() {
    const fg = await Location.requestForegroundPermissionsAsync();
    if (fg.status !== 'granted') return;

    const bg = await Location.requestBackgroundPermissionsAsync();
    if (bg.status !== 'granted') return;

    const running = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK
    );

    if (!running) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK, {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // 🔥 every 5 sec
        distanceInterval: 0,
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'Technician Tracking',
          notificationBody: 'Live tracking enabled',
        },
      });
    }
  }

  async stop() {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK);
  }
}

export default new BackgroundTracker();
