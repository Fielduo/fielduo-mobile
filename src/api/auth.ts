import NetInfo from '@react-native-community/netinfo';

import User from '@/database/models/User';
import { api } from './cilent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncDatabase } from '@/database/sync';
import { database } from '@/database';
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