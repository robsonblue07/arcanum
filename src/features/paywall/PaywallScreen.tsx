import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { toUserError } from '../../lib/to-user-error';
import { setPremiumUnlocked } from '../../store/premium';
import { colors, fonts, radii } from '../../theme';
import { AppText } from '../../ui/AppText';
import { GhostButton } from '../../ui/GhostButton';
import { GoldButton } from '../../ui/GoldButton';
import { Screen } from '../../ui/Screen';

type PlanId = 'lifetime' | 'monthly';

const BENEFITS = [
  'Liberação de todas as assinaturas harmônicas',
  'Ateliê de treino guiado ilimitado',
  'Exportação de firmas em PNG transparente',
] as const;

export function PaywallScreen() {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanId>('lifetime');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const close = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/signature-lab');
  };

  const unlock = async () => {
    setLoading(true);
    setError(undefined);
    try {
      await setPremiumUnlocked(true);
      router.replace('/(tabs)/signature-lab');
    } catch (caught) {
      setError(toUserError(caught));
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Pressable accessibilityRole="button" hitSlop={12} onPress={close} style={styles.close}>
        <Ionicons color={colors.goldSoft} name="close" size={22} />
      </Pressable>

      <AppText variant="kicker" style={styles.kicker}>
        Arcanum Pro
      </AppText>
      <AppText variant="display" style={styles.title}>
        Liberte seu Destino Financeiro
      </AppText>
      <AppText variant="body" style={styles.subtitle}>
        A sua assinatura atual está travando sua prosperidade. Desbloqueie sua nova identidade.
      </AppText>

      <View style={styles.benefits}>
        {BENEFITS.map((item) => (
          <View key={item} style={styles.benefitRow}>
            <Ionicons color={colors.gold} name="checkmark-circle" size={20} />
            <AppText variant="body" style={styles.benefitText}>
              {item}
            </AppText>
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => setPlan('lifetime')}
        style={[styles.plan, plan === 'lifetime' ? styles.planSelected : null]}
      >
        <View style={styles.planHeader}>
          <AppText variant="kicker">Recomendado</AppText>
          {plan === 'lifetime' ? (
            <Ionicons color={colors.gold} name="sparkles" size={18} />
          ) : null}
        </View>
        <AppText variant="title" style={styles.planTitle}>
          Acesso Vitalício
        </AppText>
        <AppText variant="number" style={styles.price}>
          R$ 97,00
        </AppText>
        <AppText variant="caption" style={styles.planHint}>
          Pagamento único
        </AppText>
      </Pressable>

      <Pressable
        onPress={() => setPlan('monthly')}
        style={[styles.plan, plan === 'monthly' ? styles.planSelected : null]}
      >
        <AppText variant="title" style={styles.planTitle}>
          Membro Arcanum Pro
        </AppText>
        <AppText variant="number" style={styles.price}>
          R$ 29,90
        </AppText>
        <AppText variant="caption" style={styles.planHint}>
          Por mês
        </AppText>
      </Pressable>

      {error !== undefined ? (
        <AppText variant="body" style={styles.error}>
          {error}
        </AppText>
      ) : null}

      <GoldButton
        label="Garantir Minha Transformação Agora"
        loading={loading}
        onPress={() => {
          void unlock();
        }}
        style={styles.cta}
      />

      <GhostButton
        disabled={loading}
        label="Restaurar Compras"
        onPress={() => {
          void unlock();
        }}
        style={styles.restore}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  close: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderColor: colors.line,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    marginBottom: 18,
    width: 40,
  },
  kicker: {
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    lineHeight: 42,
  },
  subtitle: {
    marginTop: 12,
    marginBottom: 22,
  },
  benefits: {
    gap: 12,
    marginBottom: 22,
  },
  benefitRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  plan: {
    backgroundColor: 'rgba(14, 8, 28, 0.72)',
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: 12,
    padding: 18,
  },
  planSelected: {
    backgroundColor: colors.goldDim,
    borderColor: colors.gold,
    borderWidth: 1.5,
  },
  planHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  planTitle: {
    fontSize: 22,
    lineHeight: 28,
  },
  price: {
    fontFamily: fonts.bodyBold,
    fontSize: 28,
    marginTop: 6,
  },
  planHint: {
    color: colors.goldSoft,
    letterSpacing: 1.2,
    marginTop: 4,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 8,
  },
  cta: {
    marginTop: 8,
  },
  restore: {
    borderWidth: 0,
    marginTop: 4,
    minHeight: 44,
    opacity: 0.7,
  },
});
