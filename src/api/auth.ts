import NetInfo from '@react-native-community/netinfo';

import User from '@/database/models/User';
import { api } from './cilent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncDatabase } from '@/database/sync';
import { database } from '@/database';
interface LoginResponse { user?: any; tokens?: { access: string; refresh: string } }
interface SignupResponse { success: boolean; message?: string }


export const login = async (email: string, password: string) => {
  console.log("🔑 Attempting login for:", email);

  const usersCollection = database.get<User>('users');

  // 1️⃣ Check local DB first
  const localUsers = await usersCollection.query().fetch();
  const localUser = localUsers.find(u => u.email === email && u.passwordHash === password);

  if (localUser) {
    console.log("✅ User found locally:", localUser.email);
    return { user: localUser, tokens: null };
  }

  // 2️⃣ Check network connectivity
  const state = await NetInfo.fetch();
  if (!state.isConnected) throw new Error("Offline and user not found locally");
  console.log("🌐 Network state: Online");

  // 3️⃣ Fetch from backend API
  const response = await api.post<LoginResponse>('/login', { email, password });
  if (!response.user) throw new Error("Login failed: no user data received");
  console.log("📥 API response received:", response);

  // 4️⃣ Store user locally
await database.write(async () => {
  await usersCollection.create(u => {
    u.serverId = response.user.id ?? '';
    u.email = response.user.email ?? '';
    u.firstName = response.user.first_name ?? '';
    u.lastName = response.user.last_name ?? '';
    u.organizationId = response.user.organization_id ?? '';
    u.role = response.user.role ?? 'user';
    u.roleId = response.user.role_id ?? '';
    u.profileId = response.user.profile_id ?? '';
    u.isSystemAdmin = response.user.is_system_admin ?? false;
    u.passwordHash = password;
    u.isSynced = true;
    u.isActive = response.user.is_active ?? true;
    u.isVerified = response.user.is_verified ?? false;
    u.updatedAt = Date.now();
  });
});


  console.log("💾 User stored locally");

  // 5️⃣ Save auth token
  if (response.tokens?.access) {
    await AsyncStorage.setItem('authToken', response.tokens.access);
    console.log("🔐 Auth token saved");
  }

  // 6️⃣ Trigger database sync
  syncDatabase();
  console.log("🔄 Triggered database sync");

  return { user: response.user, tokens: response.tokens };
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
