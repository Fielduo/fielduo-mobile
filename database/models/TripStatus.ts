import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class TripStatus extends Model {
  static table = 'trip_statuses';

@field('status_id') statusId!: string; // ✅ string in model

  @field('name') name!: string;
}
