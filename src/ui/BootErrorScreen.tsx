import { StyleSheet, View } from 'react-native';
import { useAuthStore } from '../store/auth-store';
import { colors } from '../theme';
import { AppText } from './AppText';
import { GoldButton } from './GoldButton';
import { Screen } from './Screen';

interface BootErrorScreenProps {
  message: string;
}

export function BootErrorScreen({ message }: BootErrorScreenProps) {
  const retryBoot = useAuthStore((state) => state.retryBoot);

  return (
    <Screen>
      <View style={styles.body}>
        <AppText variant="kicker">Conexão</AppText>
        <AppText variant="title" style={styles.title}>
          Não foi possível abrir o Arcanum
        </AppText>
        <AppText variant="body" style={styles.copy}>
          {message}
        </AppText>
      </View>
      <GoldButton label="Tentar novamente" onPress={retryBoot} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  copy: {
    color: colors.mist,
    maxWidth: 360,
  },
});
