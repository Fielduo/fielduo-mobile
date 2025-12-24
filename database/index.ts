import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { mySchema } from './schema';

import User from './models/User';
import Trip from './models/Triplog';
import TripStatus from './models/TripStatus';
import WorkOrder from './models/WorkOrder';
import { Equipment } from './models/Equipment';


const adapter = new SQLiteAdapter({
  schema: mySchema,
});

export const database = new Database({
  adapter,
  modelClasses: [
    User,
    Trip, // ✅ MUST ADD THIS
    TripStatus,
    WorkOrder,
    Equipment,
  ],
});
