import React from 'react';
import { Image } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PerformanceListScreen from './src/features/performances/screens/PerformanceListScreen';
import PerformanceDetailScreen from './src/features/performances/screens/PerformanceDetailScreen';
import PerformanceFormScreen from './src/features/performances/screens/PerformanceFormScreen';
import ConcertsScreen from './src/features/performances/screens/ConcertsScreen';
import ArtistsScreen from './src/features/performances/screens/ArtistsScreen';
import GroupedPerformancesScreen from './src/features/performances/screens/GroupedPerformancesScreen';
import { PerformancesProvider } from './src/features/performances/context/PerformancesContext';
import { RootStackParamList } from './src/navigation/types';
import { colors } from './src/theme/tokens';
import ManageCatalogScreen from './src/features/catalog/screens/ManageCatalogScreen';
import ManageGenresScreen from './src/features/catalog/screens/ManageGenresScreen';
import ManageSubGenresScreen from './src/features/catalog/screens/ManageSubGenresScreen';
import ManageVenuesScreen from './src/features/catalog/screens/ManageVenuesScreen';
import ManageBillingsScreen from './src/features/catalog/screens/ManageBillingsScreen';
import ManageTagsScreen from './src/features/catalog/screens/ManageTagsScreen';
import { AuthProvider } from './src/features/auth/context/AuthContext';
import AppGate from './src/navigation/AppGate';
import SettingsScreen from './src/features/settings/screens/SettingsScreen';
import CreditsScreen from './src/features/settings/screens/CreditsScreen';
import ConcertFormScreen from './src/features/performances/screens/ConcertFormScreen';
import ArtistFormScreen from './src/features/performances/screens/ArtistFormScreen';
import CatalogUsageScreen from './src/features/catalog/screens/CatalogUsageScreen';

const Tab = createBottomTabNavigator();
const PerformancesStack = createNativeStackNavigator<RootStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.accent,
  },
};

function TabIcon({
  source,
  color,
  size = 22,
}: {
  source: any;
  color: string;
  size?: number;
}) {
  return (
    <Image
      source={source}
      style={{
        width: size,
        height: size,
        resizeMode: 'contain',
        tintColor: color,
      }}
    />
  );
}

function PerformancesStackNavigator() {
  return (
    <PerformancesStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <PerformancesStack.Screen
        name="PerformanceList"
        component={PerformanceListScreen}
      />
    </PerformancesStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen
        name="Performances"
        component={PerformancesStackNavigator}
        options={{
          lazy: false,
          tabBarIcon: ({ color, size }) => (
            <TabIcon
              source={require('./assets/icons/microphone.png')}
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Concerts"
        component={ConcertsScreen}
        options={{
          lazy: false,
          tabBarIcon: ({ color, size }) => (
            <TabIcon
              source={require('./assets/icons/ticket.png')}
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Artists"
        component={ArtistsScreen}
        options={{
          lazy: false,
          tabBarIcon: ({ color, size }) => (
            <TabIcon
              source={require('./assets/icons/guitar.png')}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppGate>
        <PerformancesProvider>
          <NavigationContainer theme={navigationTheme}>
            <RootStack.Navigator screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'slide_from_right',
            }}>
              <RootStack.Screen name="MainTabs" component={MainTabs} />
              <RootStack.Screen name="Settings" component={SettingsScreen} />
              <RootStack.Screen name="Credits" component={CreditsScreen} />
              <RootStack.Screen
                name="GroupedPerformances"
                component={GroupedPerformancesScreen}
              />
              <RootStack.Screen
                name="PerformanceDetail"
                component={PerformanceDetailScreen}
              />
              <RootStack.Screen
                name="PerformanceForm"
                component={PerformanceFormScreen}
              />
              <RootStack.Screen
                name="ConcertForm"
                component={ConcertFormScreen}
              />
              <RootStack.Screen
                name="ArtistForm"
                component={ArtistFormScreen}
              />
              <RootStack.Screen
                name="ManageCatalog"
                component={ManageCatalogScreen}
              />
              <RootStack.Screen name="CatalogUsage" component={CatalogUsageScreen} />
              <RootStack.Screen name="ManageBillings" component={ManageBillingsScreen} />
              <RootStack.Screen name="ManageTags" component={ManageTagsScreen} />
              <RootStack.Screen name="ManageVenues" component={ManageVenuesScreen} />
              <RootStack.Screen name="ManageGenres" component={ManageGenresScreen} />
              <RootStack.Screen
                name="ManageSubGenres"
                component={ManageSubGenresScreen}
              />
            </RootStack.Navigator>
          </NavigationContainer>
        </PerformancesProvider>
      </AppGate>
    </AuthProvider>
  );
}