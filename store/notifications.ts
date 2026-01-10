// // notifications.ts
// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
// import { Platform } from 'react-native';

// export async function registerForPushNotificationsAsync() {
//   if (!Device.isDevice) {
//     alert('Physical device required for push notifications');
//     return;
//   }

//   const { status: existingStatus } = await Notifications.getPermissionsAsync();
//   let finalStatus = existingStatus;

//   if (existingStatus !== 'granted') {
//     const { status } = await Notifications.requestPermissionsAsync();
//     finalStatus = status;
//   }

//   if (finalStatus !== 'granted') {
//     alert('Failed to get push token for notifications!');
//     return;
//   }

//   const token = (await Notifications.getExpoPushTokenAsync()).data;
//   console.log('Push Notification Token:', token);
//   return token;
// }

// // Android specific channel for high priority
// export function createNotificationChannel() {
//   if (Platform.OS === 'android') {
//     Notifications.setNotificationChannelAsync('urgent', {
//       name: 'Urgent Jobs',
//       importance: Notifications.AndroidImportance.MAX,
//       vibrationPattern: [0, 250, 250, 250],
//       sound: 'default',
//       enableLights: true,
//       lightColor: '#FF0000',
//     });
//   }
// }
