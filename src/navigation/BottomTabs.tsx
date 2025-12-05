import React from 'react';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from '../screens/Home/HomeScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import SearchmenuNavigator from './StackNavigator/SearchmenuNavigator';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom']}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,

          tabBarIcon: ({ focused, color, size }) => {
            // default icon — must be valid Ionicons name
            let iconName: keyof typeof Ionicons.glyphMap = 'home';

            switch (route.name) {
              case 'Home':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'Search':
                iconName = focused ? 'search' : 'search-outline';
                break;
              case 'Settings':
                iconName = focused ? 'settings' : 'settings-outline';
                break;
              case 'Profile':
                iconName = focused ? 'person' : 'person-outline';
                break;
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },


          tabBarActiveTintColor: '#6C63FF',
          tabBarInactiveTintColor: '#999',

          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 0.4,
            borderTopColor: '#ccc',
            height: Platform.OS === 'ios' ? 80 : 60,
            paddingBottom: Platform.OS === 'ios' ? 20 : 10,
            paddingTop: 6,
            elevation: 20, // shadow for Android
          },

          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 2,
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Search" component={SearchmenuNavigator} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default BottomTabNavigator;
