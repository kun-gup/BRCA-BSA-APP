import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Calendar, Trophy, Bell, User } from 'lucide-react-native';

import HomeNavigator from './HomeNavigator';
import CalendarScreen from '../screens/MainTabs/CalendarScreen';
import LeaderboardScreen from '../screens/MainTabs/LeaderboardScreen';
import NoticesScreen from '../screens/MainTabs/NoticesScreen';
import ProfileScreen from '../screens/MainTabs/ProfileScreen';

import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingTop: 5,
          paddingBottom: 5,
        },
        tabBarActiveTintColor: COLORS.primaryRed,
        tabBarInactiveTintColor: COLORS.tabInactive,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeNavigator} 
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Notices" 
        component={NoticesScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}
