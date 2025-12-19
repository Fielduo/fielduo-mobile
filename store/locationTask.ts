import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo';
import { api } from '@/src/api/cilent';

export const LOCATION_TASK = 'TECHNICIAN_BG_TRACK';

TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error) return;

  const { locations } = data as any;
  const loc = locations?.[0];
  if (!loc) return;

  const net = await NetInfo.fetch();
  if (!net.isConnected) return;

  try {
    await api.post('/technician-locations/track', {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      accuracy: loc.coords.accuracy,
      speed: loc.coords.speed ?? 0,
    });

    console.log('📡 BG location sent');
  } catch (e) {
    console.log('❌ BG send failed', e);
  }
});
