import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const mySchema = appSchema({
  version: 7,
  tables: [
    tableSchema({
      name: 'users',
      columns: [
        { name: 'first_name', type: 'string' },
        { name: 'last_name', type: 'string' },
        { name: 'email', type: 'string', isIndexed: true },
        { name: 'phone', type: 'string', isOptional: true },
        { name: 'country_code', type: 'string', isOptional: true },
        { name: 'password_hash', type: 'string', isOptional: true },
        { name: 'synced', type: 'boolean' },
        { name: 'deleted', type: 'boolean', isOptional: true },
        { name: 'updated_at', type: 'number' },
        { name: 'server_id', type: 'string', isOptional: true },
        { name: 'role', type: 'string', isOptional: true },
        { name: 'role_id', type: 'string', isOptional: true },
        { name: 'profile_id', type: 'string', isOptional: true },
        { name: 'organization_id', type: 'string', isOptional: true },
        { name: 'is_active', type: 'boolean', isOptional: true },
        { name: 'is_verified', type: 'boolean', isOptional: true },
        { name: 'is_system_admin', type: 'boolean', isOptional: true },
        { name: 'is_synced', type: 'boolean', isOptional: true },
      ],
    }),

    // ✅ TRIPS TABLE (correct place)
    tableSchema({
      name: 'trips',
      columns: [
        { name: 'trip_id', type: 'string', isIndexed: true },
        { name: 'data', type: 'string' },
        { name: 'timestamp', type: 'number', isIndexed: true },
         { name: 'sync_state', type: 'string', isIndexed: true }, // ✅ NEW
      ],
    }),
    tableSchema({
  name: 'trip_statuses',
  columns: [
    { name: 'status_id', type: 'string', isIndexed: true }, // ✅ change number → string
    { name: 'name', type: 'string' },
  ],
}),
tableSchema({
  name: "work_orders",
  columns: [
    { name: "data", type: "string" },
  ],
}),
tableSchema({
      name: "equipment_conditions",
      columns: [
         { name: "server_id", type: "string" },   // ✅ ADD
        { name: "name", type: "string" },
        { name: "description", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
  ],
});
