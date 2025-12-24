import { Model } from "@nozbe/watermelondb";
import { field } from "@nozbe/watermelondb/decorators";

export default class WorkOrder extends Model {
  static table = "work_orders";

  @field("data") data!: string;
}
