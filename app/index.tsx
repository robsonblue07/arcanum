import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { OnboardingScreen } from '../src/features/onboarding';
import { useProfileStore } from '../src/store/profile-store';
import { colors } from '../src/theme';

export default function IndexScreen() {
  const hasHydrated = useProfileStore((state) => state.hasHydrated);
  const profile = useProfileStore((state) => state.profile);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!useProfileStore.getState().hasHydrated) {
        useProfileStore.setState({ hasHydrated: true });
      }
    }, 800);
    return () => clearTimeout(timeout);
  }, []);

  if (!hasHydrated) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  if (profile !== null) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return <OnboardingScreen />;
}

const styles = StyleSheet.create({
  boot: {
    alignItems: 'center',
    backgroundColor: colors.void,
    flex: 1,
    justifyContent: 'center',
  },
});
