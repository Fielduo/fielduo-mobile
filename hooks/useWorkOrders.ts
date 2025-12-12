
import { useEffect, useState } from "react";
import { database } from "@/database";
import { WorkOrder } from "@/types/Worker";

export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  useEffect(() => {
    const collection = database.get("work_orders");

    const subscription = collection.query().observe().subscribe((records) => {
      setWorkOrders(records as WorkOrder[]);
    });

    return () => subscription.unsubscribe();
  }, []);

  return workOrders;
}
