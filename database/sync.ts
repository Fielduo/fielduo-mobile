import { synchronize } from "@nozbe/watermelondb/sync";
import NetInfo from "@react-native-community/netinfo";
import { database } from "./index";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { syncOfflineSignups } from "@/src/api/auth";
import TripStatus from "./models/TripStatus";
import { syncTripsToServer } from "./local/triplog";

// ----------------------------------------------------
//  API URL
// 10.0.2.2 → Android Emulator maps to your PC localhost
// Replace with your LOCAL IP when testing on real device
// Example: "http://192.168.1.5:5000/v1/sync"
// ----------------------------------------------------
const API_URL = "http://10.0.2.2:5000/v1/sync"; // https://fielduo.com/v1/sync

// ----------------------------------------------------
//  MAIN SYNC FUNCTION
// ----------------------------------------------------
export async function syncDatabase() {
  try {
    console.log(" Watermelon Sync Started...");

    const token = await AsyncStorage.getItem("authToken");

    await synchronize({
      database,

      // ⬇️ PULL CHANGES FROM SERVER ===============================
      pullChanges: async ({ lastPulledAt }) => {
        console.log("⬇ Pulling changes... Last:", lastPulledAt);

        const response = await fetch(
          `${API_URL}/pull?lastPulledAt=${lastPulledAt || 0}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Pull failed ${response.status}`);
        }

        const data = await response.json();

        console.log(" Pull Success", data);

        return {
          changes: data.changes,
          timestamp: data.timestamp,
        };
      },

      // ⬆️ PUSH CHANGES TO SERVER ================================
      pushChanges: async ({ changes }) => {
        console.log(" Pushing local changes...");

        const response = await fetch(`${API_URL}/push`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ changes }),
        });

        if (!response.ok) {
          throw new Error(`Push failed ${response.status}`);
        }

        console.log(" Push Success!");
      },

      migrationsEnabledAtVersion: 1,
    });

    console.log(" Watermelon Sync Completed!");
  } catch (err) {
    console.log(" Watermelon Sync Failed:", err);
  }
}

// ----------------------------------------------------
// AUTO-SYNC ON NETWORK RECONNECT
// ----------------------------------------------------
export function setupAutoSync() {
  NetInfo.addEventListener(async (state) => {
    if (state.isConnected) {
      console.log(" Online → Auto-Sync Triggered");

      try {
        await syncDatabase();        // WatermelonDB
        await syncTripsToServer();   // Trip logs 🔥
        await syncOfflineSignups();  // Auth

        console.log(" Auto-sync cycle completed");
      } catch (err) {
        console.log(" Auto-sync failed:", err);
      }
    }
  });
}


export const isOnline = async () => {
  const state = await NetInfo.fetch();
  return !!state.isConnected;
};