import { Redirect } from 'expo-router';
import { AuthScreen } from '../src/features/auth';
import { useBootGate } from '../src/store/use-boot-gate';
import { BootErrorScreen } from '../src/ui/BootErrorScreen';
import { FontSplash } from '../src/ui/FontSplash';

export default function LoginRoute() {
  const gate = useBootGate();

  if (gate.type === 'splash') {
    return <FontSplash />;
  }
  if (gate.type === 'error') {
    return <BootErrorScreen message={gate.message} />;
  }
  if (gate.type !== 'login') {
    return <Redirect href="/" />;
  }

  return <AuthScreen />;
}
