import { database } from "@/database";



const workOrderCollection = database.get("work_orders");

export const saveWorkOrdersToLocalDB = async (orders: any[]) => {
  await database.write(async () => {
    for (const wo of orders) {
      const existing = await workOrderCollection.query().fetch();

      const found = existing.find(
        (e: any) => JSON.parse(e.data).id === wo.id
      );

      if (!found) {
        await workOrderCollection.create((w: any) => {
          w.data = JSON.stringify(wo);
        });
      }
    }
  });
};

export const updateWorkOrderAssignmentOffline = async (
  workOrderId: string,
  assignmentData: any
) => {
  const collection = database.get("work_orders");

  const records = await collection.query().fetch();

  const record = records.find(
    (r: any) => JSON.parse(r.data).id === workOrderId
  );

  if (!record) return;

  await database.write(async () => {
    await record.update((r: any) => {
      const existing = JSON.parse(r.data);

      r.data = JSON.stringify({
        ...existing,
        ...assignmentData, // 🔥 assignment + gps merged
      });
    });
  });
};
