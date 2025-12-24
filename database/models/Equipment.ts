import { Model } from "@nozbe/watermelondb";
import { field, date, relation } from "@nozbe/watermelondb/decorators";

export class Equipment extends Model {
  static table = "equipment_conditions"; // must match your database table name
  @field("server_id") server_id!: string;   // ✅ ADD THIS
  @field("name") name!: string;
  @field("description") description!: string;

  // optional: timestamps
  @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;
}
