// D:\React\fielduo-mobile\src\api\auth.ts

import { database } from "@/database";

import User from "@/database/models/User";
import NetInfo from '@react-native-community/netinfo';
import { api } from "./cilent";


interface LoginResponse {
  success: boolean;
  message?: string;
  user?: any;
  tokens?: { access: string; refresh: string };
  next_signup_step?: string;
}

interface SignupResponse {
  success: boolean;
  message?: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  console.log('Sending login request:', { email, password });
  try {
    const res = await api.post<LoginResponse>('/login', { email, password });
    console.log('Login API response:', res);

    if (res.success && res.tokens?.access) {
      // ✅ Save token to AsyncStorage for api interceptor
      await api.setToken(res.tokens.access);
      console.log('🔑 Token saved:', res.tokens.access);
    }

    return res;
  } catch (err: any) {
    console.error('Login API error:', err.response?.data || err.message);
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

export const offlineSignup = async (userData: {
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  password: string;
  countryCode: string;
}) => {
  console.log('offlineSignup called with:', userData);

  const usersCollection = database.get<User>('users');

  const timestamp = Date.now();
  console.log('Timestamp:', timestamp);

  // Save locally first
  const localUser = await database.action(async () => {
    return await usersCollection.create((user) => {
      user.firstName = userData.firstname;
      user.lastName = userData.lastname;
      user.email = userData.email;
      user.phone = userData.phonenumber;
      user.countryCode = userData.countryCode;
      user.passwordHash = userData.password; // hash later if needed
      user.isSynced = false;
      user.createdAt = timestamp;
      user.updatedAt = timestamp;
    });
  });
  console.log('Local user created:', localUser);

  // Check internet
  const state = await NetInfo.fetch();
  console.log('Network state:', state);

  if (state.isConnected) {
    try {
      console.log('Online: trying to sync with server...');
      const response = await api.post('/signup', {
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        phonenumber: userData.phonenumber,
        password: userData.password,
        confirmPassword: userData.password,
        countryCode: userData.countryCode,
      });

    

      // Mark as synced
      await database.action(async () => {
        await localUser.update((u) => {
          u.isSynced = true;
        });
      });
      console.log('Local user marked as synced');

      return response;
    } catch (err) {
      console.log('Server signup failed, will sync later', err);
    }
  } else {
    console.log('Offline, signup stored locally');
  }

  return localUser;
};
