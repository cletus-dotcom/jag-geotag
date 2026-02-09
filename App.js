import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CameraScreen from './src/screens/CameraScreen';
import GalleryScreen from './src/screens/GalleryScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#1a1a2e' },
            headerTintColor: '#eaeaea',
            headerTitleStyle: { fontWeight: '700', fontSize: 18 },
            tabBarStyle: { backgroundColor: '#1a1a2e', borderTopColor: '#16213e' },
            tabBarActiveTintColor: '#4ade80',
            tabBarInactiveTintColor: '#94a3b8',
            tabBarLabelStyle: { fontWeight: '600' },
          }}
        >
          <Tab.Screen
            name="Camera"
            component={CameraScreen}
            options={{ title: 'Jag GeoTag', tabBarLabel: 'Camera' }}
          />
          <Tab.Screen
            name="Gallery"
            component={GalleryScreen}
            options={{ tabBarLabel: 'Gallery' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
