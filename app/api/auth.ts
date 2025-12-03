// D:\React\fielduo-mobile\src\api\auth.ts

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

export const signup = async (formData: {
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  password: string;
  confirmPassword: string;
  countryCode?: string;
}): Promise<SignupResponse> => {
  try {
    const res = await api.post<SignupResponse>('/signup', formData);
    return res;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Signup failed');
  }
};