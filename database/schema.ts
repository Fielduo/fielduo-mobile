import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const mySchema = appSchema({
  version: 3,
  tables: [
   tableSchema({
  name: 'users',
  columns: [
    { name: 'first_name', type: 'string' },
    { name: 'last_name', type: 'string' },
    { name: 'email', type: 'string', isIndexed: true },
    { name: 'phone', type: 'string', isOptional: true }, // ✅ added
    { name: 'country_code', type: 'string', isOptional: true }, // ✅ added
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
})

    // Add other tables (work_orders, trips...) in the same pattern
  ],
});
