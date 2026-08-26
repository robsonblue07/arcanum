import { Redirect } from 'expo-router';
import { OnboardingScreen } from '../src/features/onboarding';
import { useBootGate } from '../src/store/use-boot-gate';
import { BootErrorScreen } from '../src/ui/BootErrorScreen';
import { FontSplash } from '../src/ui/FontSplash';

export default function OnboardingRoute() {
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
  if (gate.type === 'app') {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return <OnboardingScreen />;
}
