import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';


import BottomTabNavigator from '../navigation/BottomTabs';

import AuthNavigator from './StackNavigator/AuthNavigator';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '../api/cilent';
import Layout from '@/components/common/layout';


interface MeResponse {
  success: boolean;
  user?: any;
}

export type RootStackParamList = {
  AuthStack: undefined;
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const user = useAuthStore((state) => state.user); 
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const initAuth = async () => {
    const token = await AsyncStorage.getItem('authToken');

    if (token) {
      try {
        const res = await api.get<MeResponse>('/me');

        if (res.success && res.user) {
          setUser(res.user);
        }
      } catch (err) {
        console.log("Token invalid OR offline. Skipping /me check.");
      }
    } else {
      const localUser = useAuthStore.getState().user;
      if (localUser) {
        console.log(" Using offline stored user");
      }
    }

    setLoading(false);
  };

  initAuth();
}, []);

  if (loading) return null; 
const MainTabsWithLayout = () => {
  return (
    <Layout>
      <BottomTabNavigator />
    </Layout>
  );
};
  return (
     <Stack.Navigator id="root" screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="AuthStack" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="MainTabs" component={MainTabsWithLayout} />
      )}
    </Stack.Navigator>
  );
}
