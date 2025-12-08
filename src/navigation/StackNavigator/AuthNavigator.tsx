import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/useAuthStore';
import LoginScreen from '@/components/auth/LoginScreen';
import Signup from '@/components/auth/SignupScreen';
import ForgetPasswordScreen from '@/components/auth/ForgetPasswordScreen';
import VerificationCodeScreen from '@/components/auth/VerifyEmailScreen';
import CreateNewPasswordScreen from '@/components/auth/CreateNewPasswordScreen';


export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgetPassword: undefined;
  VerifyEmail: { email: string };
  ResetPassword: { email: string };
};

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  const user = useAuthStore((state) => state.user);

  return (

    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#fff" },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
      <Stack.Screen name="VerifyEmail" component={VerificationCodeScreen} />
      <Stack.Screen name="ResetPassword" component={CreateNewPasswordScreen} />
    </Stack.Navigator>



  );
}