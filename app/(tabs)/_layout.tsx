import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useProfileStore } from '../../src/store/profile-store';
import { colors } from '../../src/theme';

export default function TabsLayout() {
  const hasHydrated = useProfileStore((state) => state.hasHydrated);
  const profile = useProfileStore((state) => state.profile);

  if (hasHydrated && profile === null) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.goldSoft,
        tabBarInactiveTintColor: colors.mist,
        tabBarStyle: {
          backgroundColor: colors.ink,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="sparkles-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="signature-lab"
        options={{
          title: 'Laboratório',
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="color-wand-outline" size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
