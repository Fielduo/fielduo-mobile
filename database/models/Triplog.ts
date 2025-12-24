import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Trip extends Model {
    static table = 'trips';

    @field('trip_id') tripId!: string;
    @field('data') data!: string;
    @field('timestamp') timestamp!: number;
   @field("sync_state") syncState!: "pending" | "synced" | "deleted";
}
