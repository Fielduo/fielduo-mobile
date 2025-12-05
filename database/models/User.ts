import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class User extends Model {
  static table = 'users';

  @field('first_name') firstName!: string;
  @field('last_name') lastName!: string;
  @field('email') email!: string;
  @field('phone') phone!: string; // ✅ added
  @field('country_code') countryCode!: string; // ✅ added
  @field('role') role!: string;
  @field('role_id') roleId!: string;
  @field('profile_id') profileId!: string;
  @field('organization_id') organizationId!: string;
  @field('is_active') isActive!: boolean;
  @field('is_verified') isVerified!: boolean;
  @field('is_system_admin') isSystemAdmin!: boolean;
  @field('server_id') serverId!: string;
  @field('password_hash') passwordHash!: string;
  @field('is_synced') isSynced!: boolean;
  @field('updated_at') updatedAt!: number;
}
