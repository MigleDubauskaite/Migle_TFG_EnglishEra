import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';

import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import QuizScreen from '../screens/QuizScreen';
import EventsScreen from '../screens/EventsScreen';
import BlogScreen from '../screens/BlogScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminScreen from '../screens/AdminScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '⌂', Quiz: '✎', Events: '◉', Blog: '✦', Resources: '☰', Profile: '◯', Admin: '⚙',
  };
  return (
    <Text style={{ fontSize: 18, color: focused ? Colors.navy : Colors.stone400 }}>
      {icons[name] ?? '•'}
    </Text>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: Colors.white },
        headerTitleStyle: { fontWeight: '900', color: Colors.stone900, fontSize: 17 },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.stone200,
          borderTopWidth: 1.5,
          paddingTop: 6,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor: Colors.navy,
        tabBarInactiveTintColor: Colors.stone400,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home"      component={HomeScreen}      options={{ title: 'Home' }} />
      <Tab.Screen name="Quiz"      component={QuizScreen}      options={{ title: 'Quizzes' }} />
      <Tab.Screen name="Events"    component={EventsScreen}    options={{ title: 'Events' }} />
      <Tab.Screen name="Blog"      component={BlogScreen}      options={{ title: 'Blog' }} />
      <Tab.Screen name="Resources" component={ResourcesScreen} options={{ title: 'Resources' }} />
      <Tab.Screen name="Profile"   component={ProfileScreen}   options={{ title: 'Profile' }} />
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminScreen}
          options={{ title: 'Admin', tabBarLabel: 'Admin' }}
        />
      )}
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.navy }}>
        <ActivityIndicator color={Colors.steel} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <>
            <Stack.Screen name="Login"    component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
