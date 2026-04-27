import React, { useEffect, useState } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ClipboardList, Bell, User } from 'lucide-react-native';

import LoginScreen from './src/screens/Auth/LoginScreen';
import NotificationsScreen from './src/screens/Dashboard/NotificationsScreen';
import ProfileScreen from './src/screens/Dashboard/ProfileScreen';
import DraftsScreen from './src/screens/Offline/DraftsScreen';
import FormFillScreen from './src/screens/Forms/FormFillScreen';
import KYCUploadScreen from './src/screens/KYC/KYCUploadScreen';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  FormFill: { formId: string; draftId?: string };
  KYC: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'My Work') return <ClipboardList size={size} color={color} />;
          if (route.name === 'Alerts') return <Bell size={size} color={color} />;
          if (route.name === 'Profile') return <User size={size} color={color} />;
          return <Home size={size} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopWidth: 1,
          borderTopColor: '#1e293b',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#8b5cf6',
        tabBarInactiveTintColor: '#64748b',
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#f8fafc',
        headerTitleStyle: { fontWeight: '700' },
      })}
    >
      <Tab.Screen name="My Work" component={DraftsScreen} options={{ title: 'My Assignments' }} />
      <Tab.Screen name="Alerts" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const customTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#020617', // hsl(222 47% 4%)
    card: '#0f172a',       // hsl(222 47% 10%)
    text: '#f8fafc',
    border: '#1e293b',
    primary: '#8b5cf6',    // hsl(263 70% 58%)
  },
};

export default function App() {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    async function checkAuth() {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        setIsAuthenticated(true);
      }
      setIsReady(true);
    }
    checkAuth();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#090E1A', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={customTheme}>
      <StatusBar style="light" />
      <Stack.Navigator 
        initialRouteName={isAuthenticated ? "Main" : "Login"}
        screenOptions={{
          headerStyle: { backgroundColor: '#111827' },
          headerTintColor: '#F8FAFC',
          headerTitleStyle: { fontWeight: '700' },
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        
        <Stack.Screen 
          name="Main" 
          component={MainTabs} 
          options={{ headerShown: false }}
        />

        <Stack.Screen 
          name="FormFill" 
          component={FormFillScreen} 
          options={{ title: 'Complete Form' }}
        />
        <Stack.Screen 
          name="KYC" 
          component={KYCUploadScreen} 
          options={{ title: 'Identity Verification' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
