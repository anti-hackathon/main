// Role3 | Reworked the bottom tabs around the report, map, operations, and profile flow
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { ROLE3_COLORS } from '../../constants/role3Theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: ROLE3_COLORS.surface,
          borderTopColor: ROLE3_COLORS.border,
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: ROLE3_COLORS.accentSoft,
        tabBarInactiveTintColor: ROLE3_COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <MaterialIcons name="map" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Report',
          tabBarIcon: ({ color }) => <MaterialIcons name="report-gmailerrorred" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="operations"
        options={{
          title: 'Ops',
          tabBarIcon: ({ color }) => <MaterialIcons name="hub" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
