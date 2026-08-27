import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { colors } from '../src/theme';
import { useAppFonts } from '../src/theme/use-app-fonts';
import { useAuthBootstrap } from '../src/store/use-auth-bootstrap';
import { ErrorBoundary } from '../src/ui/ErrorBoundary';
import { FontSplash } from '../src/ui/FontSplash';

const FONT_TIMEOUT_MS = 5000;

try {
  void SplashScreen.preventAutoHideAsync();
} catch {
  // Native splash is unavailable on some web reloads.
}

export default function RootLayout() {
  const fontsLoaded = useAppFonts();
  const [fontsTimedOut, setFontsTimedOut] = useState(false);
  useAuthBootstrap();

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
      return;
    }
    const timeout = setTimeout(() => {
      setFontsTimedOut(true);
      void SplashScreen.hideAsync();
    }, FONT_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [fontsLoaded]);

  if (!fontsLoaded && !fontsTimedOut) {
    return <FontSplash />;
  }

  return (
    <ErrorBoundary>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: colors.void },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="triangle" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen
          name="report"
          options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="paywall"
          options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="synastry"
          options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="oracle"
          options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="ai-report"
          options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="forge"
          options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="train"
          options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
        />
      </Stack>
    </ErrorBoundary>
  );
}
