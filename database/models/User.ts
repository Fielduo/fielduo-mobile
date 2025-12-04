import { Model } from '@nozbe/watermelondb';
import { field, date, text } from '@nozbe/watermelondb/decorators';

export default class User extends Model {
  static table = 'users';

  @field('first_name') firstName!: string;
  @field('last_name') lastName!: string;
  @field('email') email!: string;
  @field('phone') phone!: string;
  @field('country_code') countryCode!: string;
  @field('password_hash') passwordHash!: string;
  @field('is_synced') isSynced!: boolean;
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;
}
