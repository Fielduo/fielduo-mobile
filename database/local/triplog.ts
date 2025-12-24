import NetInfo from "@react-native-community/netinfo";
import { Q } from "@nozbe/watermelondb";
import { database } from "@/database";
import Trip from "@/database/models/Triplog";
import { api } from "@/src/api/cilent";

const tripCollection = database.get<Trip>("trips");

/**
 * -------------------------
 * SAVE / UPDATE TRIP OFFLINE
 * -------------------------
 */
export const saveTripOffline = async (tripId: string, payload: any) => {
  if (!tripId) return;

  await database.write(async () => {
    const existing = await tripCollection.query(Q.where("trip_id", tripId)).fetch();
    const data = JSON.stringify(payload);

    if (existing.length > 0) {
      await existing[0].update(t => {
        t.data = data;
        t.timestamp = Date.now();
        t.syncState = "pending";
      });
    } else {
      await tripCollection.create(t => {
        t.tripId = tripId;
        t.data = data;
        t.timestamp = Date.now();
        t.syncState = "pending";
      });
    }
  });
};

/**
 * -------------------------
 * DELETE TRIP OFFLINE
 * -------------------------
 */
export const deleteTripOffline = async (tripId: string) => {
  if (!tripId) return;

  await database.write(async () => {
    const trips = await tripCollection.query(Q.where("trip_id", tripId)).fetch();
    if (trips.length > 0) {
      await trips[0].update(t => {
        t.syncState = "deleted";
        t.timestamp = Date.now();
      });
    }
  });
};

/**
 * -------------------------
 * SYNC PENDING TRIPS TO SERVER
 * -------------------------
 */
export const syncTripsToServer = async () => {
  const net = await NetInfo.fetch();



  if (!net.isConnected) {

    return;
  }

  const trips = await tripCollection
    .query(Q.where("sync_state", Q.oneOf(["pending", "deleted"])))
    .fetch();



  for (const trip of trips) {

    let payload: any;

    try {
      payload = JSON.parse(trip.data);
    } catch {
      console.log("❌ Invalid JSON for trip:", trip.tripId);
      continue;
    }

    try {
      let tripIdOnServer = payload.id;

      // ---------------- DELETE ----------------
      if (trip.syncState === "deleted") {

        await api.delete(`/trip_logs/${trip.tripId}`);
      } else {


        const fd = new FormData();

        const fields = {
          trip_id: trip.tripId,
          trip_date: payload.trip_date || "",
          start_time: payload.start_time || "",
          end_time: payload.end_time || "",
          total_duration: payload.total_duration || "",
          work_order_number: payload.work_order_number || "",
          job_assignment_id: payload.job_assignment_id || "",
          technician_name: payload.technician_name || "",
          vehicle_id: payload.vehicle_id || "",
          site_name: payload.site_name || "",
          site_address: payload.site_address || "",
          gps_coordinates: payload.gps_coordinates || "",
          start_odometer: String(payload.start_odometer ?? 0),
          end_odometer: String(payload.end_odometer ?? 0),
          total_mileage: String(payload.total_mileage ?? 0),
          travel_time: String(payload.travel_time ?? 0),
          work_description: payload.work_description || "",
          equipment_condition_id: payload.equipment_condition_id || "",
          parts_used: payload.parts_used || "",
          time_on_site: String(payload.time_on_site ?? 0),
          root_cause: payload.root_cause || "",
          resolution: payload.resolution || "",
          technician_notes: payload.technician_notes || "",
          job_status_id: payload.job_status_id || "",
        };

        Object.entries(fields).forEach(([key, value]) => {
          fd.append(key, value as string);
        });

        if (payload.images?.before) {

          fd.append("photos", {
            uri: payload.images.before,
            name: `before_${Date.now()}.jpg`,
            type: "image/jpeg",
          } as any);
        }

        if (payload.images?.after) {

          fd.append("photos", {
            uri: payload.images.after,
            name: `after_${Date.now()}.jpg`,
            type: "image/jpeg",
          } as any);
        }

        if (payload.documents?.length) {

          payload.documents.forEach((doc: any) => {
            fd.append("attachments", {
              uri: doc.uri,
              name: doc.name,
              type: doc.file?.mimeType || "application/octet-stream",
            } as any);
          });
        }

        if (payload.mode === "edit" && tripIdOnServer) {
          await api.putMultipart(`/trip_logs/${tripIdOnServer}`, fd);
        } else {
          const res = await api.postMultipart<{ id: string }>("/trip_logs", fd);
          tripIdOnServer = res?.id || tripIdOnServer;
        }
      }

      // ---------------- MARK AS SYNCED ----------------
      await database.write(async () => {
        await trip.update(t => {
          t.syncState = "synced";
          t.timestamp = Date.now();
          t.data = JSON.stringify({ ...payload, id: tripIdOnServer });
        });
      });


    } catch (err: any) {

    }
  }


};
