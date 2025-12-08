import NetInfo from '@react-native-community/netinfo';

import User from '@/database/models/User';
import { api } from './cilent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncDatabase } from '@/database/sync';
import { database } from '@/database';
import { FieldWorker, FieldWorkerTrip, Vehicle, VehiclePayload } from '@/types/Worker';
interface SignupResponse { success: boolean; message?: string }

interface LoginResponse {
  success: boolean;
  message?: string;
  user?: any;
  tokens?: { access: string; refresh: string };
  next_signup_step?: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const usersCollection = database.get<User>('users');
  const state = await NetInfo.fetch();
  const isConnected = !!state.isConnected;

  // 1️⃣ Offline login
  if (!isConnected) {
    console.log("📴 Offline login detected");
    try {
      const localUsers = await usersCollection.query().fetch();
      const localUser = localUsers.find(u => u.email === email && u.passwordHash === password);
      if (!localUser) return { success: false, message: 'No offline account found or password mismatch' };

      const token = await AsyncStorage.getItem('authToken') || 'offline-token';

      return {
        success: true,
        user: {
          id: localUser.id,
          firstname: localUser.firstName,
          lastname: localUser.lastName,
          email: localUser.email,
          phone: localUser.phone,
          countryCode: localUser.countryCode,
        },
        tokens: { access: token, refresh: token },
        message: 'Offline login successful',
      };
    } catch (err) {
      console.error("Offline login error:", err);
      return { success: false, message: 'Offline login failed' };
    }
  }

  // 2️⃣ Online login
  try {
    const res = await api.post<LoginResponse>('/login', { email, password });
    if (!res.success || !res.tokens?.access) return res;

    const user = res.user;
    const token = res.tokens.access;

    // Save token
    await AsyncStorage.setItem('authToken', token);

    // Update/create user locally for offline login
    await database.write(async () => {
      const existing = await usersCollection.query().fetch();
      const sameUser = existing.find(u => u.email === user.email);

      if (sameUser) {
        await sameUser.update(u => {
          u.firstName = user.firstname || u.firstName;
          u.lastName = user.lastname || u.lastName;
          u.phone = user.phone || u.phone;
          u.countryCode = user.countryCode || u.countryCode;
          u.passwordHash = password; // keep offline login password
          u.isSynced = true;
          u.updatedAt = Date.now();
        });
      } else {
        await usersCollection.create(u => {
          u.firstName = user.firstname;
          u.lastName = user.lastname;
          u.email = user.email;
          u.phone = user.phone;
          u.countryCode = user.countryCode || '';
          u.passwordHash = password;
          u.isSynced = true;
          u.updatedAt = Date.now();
        });
      }
    });

    // Optional: Sync any other offline users
    await syncOfflineSignups();

    return res;
  } catch (err: any) {
    console.log("Login Error:", err);
    return { success: false, message: err.message };
  }
};


export const signup = async (formData: {
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  password: string;
  confirmPassword: string;
  countryCode?: string;
}) => {
  const usersCollection = database.get<User>('users');
  const state = await NetInfo.fetch();

  console.log("🔍 Checking network state...");
  console.log("🌐 Is connected:", state.isConnected);

  if (!state.isConnected) {
    console.log("💾 Offline detected — storing user locally:", formData.email);
    await database.write(async () => {
      await usersCollection.create(u => {
        u.firstName = formData.firstname;
        u.lastName = formData.lastname;
        u.email = formData.email;
        u.phone = formData.phonenumber;
        u.countryCode = formData.countryCode || '';
        u.passwordHash = formData.password;
        u.isSynced = false;
        u.updatedAt = Date.now();
      });
    });
    console.log("✅ User stored locally, will sync later");
    return { success: true, message: 'Stored locally, will sync later' };
  }

  console.log("🌐 Online — sending signup request to API:", formData.email);
  const response = await api.post<SignupResponse>('/signup', formData);
  console.log("📥 API response received:", response);

  return response;
};

export const syncOfflineSignups = async () => {
  const usersCollection = database.get<User>('users');
  const state = await NetInfo.fetch();

  if (!state.isConnected) {
    console.log("📴 Offline — cannot sync users yet");
    return;
  }

  console.log("🔄 Checking for unsynced users...");
  const unsyncedUsers = await usersCollection.query().fetch();
  const usersToSync = unsyncedUsers.filter(u => !u.isSynced);

  console.log("📝 Unsynced users count:", usersToSync.length);

  for (const u of usersToSync) {
    try {
      console.log("🚀 Syncing user:", u.email);

      const response = await api.post<SignupResponse>('/signup', {
        firstname: u.firstName,
        lastname: u.lastName,
        email: u.email,
        phonenumber: u.phone,
        password: u.passwordHash,
        confirmPassword: u.passwordHash,
        countryCode: u.countryCode,
      });

      console.log("📥 Sync response for", u.email, ":", response);

      if (response.success) {
        console.log("✅ Marking user as synced locally:", u.email);
        await database.write(async () => {
          await u.update(user => {
            user.isSynced = true;
            user.updatedAt = Date.now();
          });
        });
      }
    } catch (err) {
      console.warn("⚠️ Failed to sync user:", u.email, err);
    }
  }
};

// 📒 TRIP LOGS API CALLS ===========================
export const createTripLog = async (formData: FormData) => {
  return await api.postMultipart("/trip_logs", formData);
};

export const updateTripLog = async (id: string, formData: FormData) => {
  return await api.putMultipart(`/trip_logs/${id}`, formData);
};


// Work Force Api
export const createWorker = async (data: FieldWorker) => api.post<FieldWorker>("/workerforce", data);

export const updateWorker = async (id: string, data: FieldWorker) => api.put<FieldWorker>(`/workerforce/${id}`, data);

export const getWorkers = async (): Promise<FieldWorker[]> => {
  const res = await api.get<FieldWorker[]>("/workerforce");
  return res; // no .data
};

export const deleteWorker = async (id: string) => api.delete<{ message: string }>(`/workerforce/${id}`);


// ✅ FieldWorkTrip
export const getTrips = async (): Promise<FieldWorkerTrip[]> => {
  try {
    const response = await api.get<FieldWorkerTrip[]>("/field_worker_trips");
    return response;
  } catch (error: any) {
    console.error("❌ Error fetching trips:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to fetch trips");
  }
};
// ✅ Create Trip
export const createTrip = async (data: {
  user_id: string;
  work_order_id: string;
  vehicle_id: string;
  started_at: string;
  ended_at: string;
}) => {
  try {
    const res = await api.post("/field_worker_trips", data);
    return res;
  } catch (error: any) {
    console.error("❌ Error creating trip:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to create trip");
  }
};
// ✅ Update Trip
export const updateTrip = async (
  id: string,
  data: {
    user_id?: string;
    work_order_id?: string;
    vehicle_id?: string;
    started_at?: string;
    ended_at?: string;
  }
) => {
  try {
    const res = await api.put(`/field_worker_trips/${id}`, data);
    return res;
  } catch (error: any) {
    console.error("❌ Error updating trip:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to update trip");
  }
};
// ✅ Delete Trip
export const deleteTrip = async (id: string) => {
  try {
    const res = await api.delete(`/field_worker_trips/${id}`);
    return res;
  } catch (error: any) {
    console.error("❌ Error deleting trip:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to delete trip");
  }
};
// ✅ Search Users
export const searchUsers = async (query: string) => {
  try {
    const res = await api.get(`/field_worker_trips/users/search?q=${query}`);
    return res;
  } catch (error: any) {
    console.error("❌ Error searching users:", error.response?.data || error.message);
    return [];
  }
};
// ✅ Search Work Orders
export const searchWorkOrders = async (query: string) => {
  try {
    const res = await api.get(`/field_worker_trips/work_orders/search?q=${query}`);
    return res;
  } catch (error: any) {
    console.error("❌ Error searching work orders:", error.response?.data || error.message);
    return [];
  }
};
// ✅ Search Vehicles
export const searchVehicles = async (query: string) => {
  try {
    const res = await api.get(`/field_worker_trips/vehicles/search?q=${query}`);
    return res;
  } catch (error: any) {
    console.error("❌ Error searching vehicles:", error.response?.data || error.message);
    return [];
  }
};



// 🔹 Vehicle 
export const vehicleService = {
  // ✅ Get All vehicle 
  async getAll(): Promise<Vehicle[]> {
    try {
      const res = await api.get<Vehicle[]>("/vehicles");
      return res; // ✅ Don't use res.data
    } catch (err: any) {
      console.error("❌ Error fetching vehicles:", err.response?.data || err.message);
      throw new Error(err.response?.data?.error || "Failed to fetch vehicles");
    }
  },

  // ✅ Get single vehicle by ID
  async getById(id: string) {
    try {
      const res = await api.get(`/vehicles/${id}`);
      return res;
    } catch (err: any) {
      console.error("❌ Error fetching vehicle:", err.response?.data || err.message);
      throw new Error(err.response?.data?.error || "Failed to fetch vehicle");
    }
  },

  // ✅ Create a new vehicle
  async create(data: VehiclePayload) {
    try {
      const res = await api.post("/vehicles", data);
      return res;
    } catch (err: any) {
      console.error("❌ Error creating vehicle:", err.response?.data || err.message);
      throw new Error(err.response?.data?.error || "Failed to create vehicle");
    }
  },

  // ✅ Update existing vehicle
  async update(id: string, data: VehiclePayload) {
    try {
      const res = await api.put(`/vehicles/${id}`, data);
      return res;
    } catch (err: any) {
      console.error("❌ Error updating vehicle:", err.response?.data || err.message);
      throw new Error(err.response?.data?.error || "Failed to update vehicle");
    }
  },

  // ✅ Delete a vehicle
  async remove(id: string) {
    try {
      const res = await api.delete(`/vehicles/${id}`);
      return res;
    } catch (err: any) {
      console.error("❌ Error deleting vehicle:", err.response?.data || err.message);
      throw new Error(err.response?.data?.error || "Failed to delete vehicle");
    }
  },
};


//WorkCompletion
export const workCompletionService = {
  // 🔹 Get all work completion statuses
  async getAll(): Promise<any[]> {
    try {
      const res = await api.get<any[]>("/work_completion_status");
      return res; // no .data needed
    } catch (err: any) {
      console.error("❌ Error fetching work completion statuses:", err.response?.data || err.message);
      throw new Error(err.response?.data?.error || "Failed to fetch work completion statuses");
    }
  },

  // 🔹 Create new work completion record
  async create(data: {
    work_order_id: string;
    status: string;
    notes?: string;
    verified_by: string;
    verified_at?: string;
  }) {
    try {
      const res = await api.post("/work_completion_status", data);
      return res;
    } catch (err: any) {
      console.error("❌ Error creating work completion status:", err.response?.data || err.message);
      throw new Error(err.response?.data?.error || "Failed to create record");
    }
  },

  // 🔹 Update work completion record
  async update(id: string, data: any) {
    try {
      const res = await api.put(`/work_completion_status/${id}`, data);
      return res;
    } catch (err: any) {
      console.error("❌ Error updating work completion status:", err.response?.data || err.message);
      throw new Error(err.response?.data?.error || "Failed to update record");
    }
  },

  // 🔹 Delete work completion record
  async remove(id: string) {
    try {
      const res = await api.delete(`/work_completion_status/${id}`);
      return res;
    } catch (err: any) {
      console.error("❌ Error deleting work completion status:", err.response?.data || err.message);
      throw new Error(err.response?.data?.error || "Failed to delete record");
    }
  },

  // 🔹 Search work orders for dropdown
  async searchWorkOrders(query: string) {
    try {
      const res = await api.get(`/work_completion_status/work_orders/search?q=${query}`);
      return res;
    } catch (err: any) {
      console.error("❌ Error searching work orders:", err.response?.data || err.message);
      return [];
    }
  },

  // 🔹 Search users for dropdown
  async searchUsers(query: string) {
    try {
      const res = await api.get(`/work_completion_status/users/search?q=${query}`);
      return res;
    } catch (err: any) {
      console.error("❌ Error searching users:", err.response?.data || err.message);
      return [];
    }
  },
};

export type QuoteResponse = {
  success: boolean;
  quotes: {
    id: string;
    quote_number: string;
    customer_name: string;
    organization_name: string;
    status: string;
    total_amount: number;
    currency: string;
    valid_until: string;
  }[];
};

export const quoteService = {
  async getQuotes(): Promise<QuoteResponse> {
    return await api.get<QuoteResponse>("/quotes");
  }
};

export const InvoiceService = {
  createInvoice: async (payload: any) => {
    return await api.post("/invoices", payload);
  },

  updateInvoice: async (id: string, payload: any) => {
    return await api.put(`/invoices/${id}`, payload);
  },
};