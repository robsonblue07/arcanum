import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useBootGate } from '../../src/store/use-boot-gate';
import { colors, fonts } from '../../src/theme';
import { BootErrorScreen } from '../../src/ui/BootErrorScreen';
import { FontSplash } from '../../src/ui/FontSplash';

export default function TabsLayout() {
  const gate = useBootGate();

  if (gate.type === 'splash') {
    return <FontSplash />;
  }
  if (gate.type === 'error') {
    return <BootErrorScreen message={gate.message} />;
  }
  if (gate.type === 'login') {
    return <Redirect href="/login" />;
  }
  if (gate.type === 'onboarding') {
    return <Redirect href="/onboarding" />;
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
          fontFamily: fonts.bodyMedium,
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
