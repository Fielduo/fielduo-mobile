import NetInfo from '@react-native-community/netinfo';

import User from './models/User';
import { api } from '@/src/api/cilent';
import { database } from './index'; // <- use full path



// import all other models...
// Example: import { Company } from './models/Company';
interface SyncResponse {
  success: boolean;
  message?: string;
  [key: string]: any; // optional extra fields
}

type TableModel = typeof User; // Adjust later to support all models

// Map your tables and their sync endpoints
const tablesToSync = [
  { name: 'users', model: database.get<User>('users'), endpoint: '/signup' },
//   { name: 'jobs', model: database.get<Job>('jobs'), endpoint: '/jobs' },
  // Add all other 15 tables here
];

/**
 * Sync one table
 */
const syncTable = async (table: any) => {
  const unsyncedRecords = await table.model.query().fetch();

  for (const record of unsyncedRecords) {
    // Check if already synced
    if ((record as any).isSynced) continue;

    try {
      // Prepare payload
     const payload: any = {};
Object.keys(record._raw).forEach((key) => {
  if (key !== 'id' && key !== 'is_synced') {
    payload[key] = record[key]; // use getters
  }
});

      // Send to server
    const response = await api.post<SyncResponse>(table.endpoint, payload);
      // Mark as synced
      if (response.success) {
        await database.action(async () => {
          await record.update((r: any) => {
            r.isSynced = true;
          });
        });
      }
    } catch (err: any) {
      console.log(`Failed to sync ${table.name}:`, err.message || err);
    }
  }
};

/**
 * Sync all tables
 */
export const syncAllTables = async () => {
  for (const table of tablesToSync) {
    await syncTable(table);
  }
};

/**
 * Listen to network changes
 */
export const setupAutoSync = () => {
 NetInfo.addEventListener((state) => {
  if (state.isConnected) {
    console.log('Device online! Syncing all tables...');
    syncAllTables().catch(console.log);
  }
});


};
