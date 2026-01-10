import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import SearchScreen from '../screens/Search/SearchScreen';
import DashboardStackNavigator from './StackNavigator/DashboardNavigator';
import SearchmenuNavigator from './StackNavigator/SearchmenuNavigator';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom']}>
      <Tab.Navigator
        id="BottomTabNavigator"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';

            switch (route.name) {
              case 'Home':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'Search':
                iconName = focused ? 'search' : 'search-outline';
                break;
              case 'Menu':
                iconName = focused ? 'menu' : 'menu-outline';
                break;
              case 'Profile':
                iconName = focused ? 'person' : 'person-outline';
                break;
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#6C63FF',
          tabBarInactiveTintColor: '#999',
        })}
      >
        {/* 🔥 Home = Dashboard Stack */}
        <Tab.Screen
          name="Home"
          component={DashboardStackNavigator}
        />

        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Menu" component={SearchmenuNavigator} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
};



export default BottomTabNavigator;
