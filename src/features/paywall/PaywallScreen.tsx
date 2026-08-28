import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { toUserError } from '../../lib/to-user-error';
import { hapticSelection, hapticSuccess } from '../../lib/haptics';
import {
  refreshPremiumFromServer,
  startStripeCheckout,
  waitForPremiumUnlock,
} from '../../services';
import { useCheckoutStore } from '../../store/checkout-store';
import { colors, fonts, radii } from '../../theme';
import { AppText } from '../../ui/AppText';
import { GhostButton } from '../../ui/GhostButton';
import { GoldButton } from '../../ui/GoldButton';
import { Screen } from '../../ui/Screen';

type PlanId = 'lifetime' | 'monthly';

const BENEFIT_KEYS = ['paywall.benefit1', 'paywall.benefit2', 'paywall.benefit3'] as const;

export function PaywallScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ intent?: string | string[]; checkout?: string | string[] }>();
  const fromForge = firstParam(params.intent) === 'forge';
  const checkoutParam = firstParam(params.checkout);
  const confirming = useCheckoutStore((state) => state.confirming);
  const [plan, setPlan] = useState<PlanId>('lifetime');
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const confirmStarted = useRef(false);

  const destination = fromForge ? ('/forge' as Href) : ('/(tabs)/signature-lab' as Href);
  const busy = loading || confirming || restoring;

  const close = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(destination);
  };

  const finishUnlocked = (): void => {
    hapticSuccess();
    router.replace(destination);
  };

  useEffect(() => {
    const shouldConfirm = checkoutParam === 'success' || confirming;
    if (!shouldConfirm || confirmStarted.current) {
      return;
    }
    confirmStarted.current = true;
    setError(undefined);
    void (async () => {
      try {
        const unlocked = await waitForPremiumUnlock();
        if (unlocked) {
          finishUnlocked();
          return;
        }
        setError(t('paywall.confirmTimeout'));
      } catch (caught) {
        setError(toUserError(caught));
      }
    })();
  }, [checkoutParam, confirming, t]);

  const onBuy = async (): Promise<void> => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await startStripeCheckout(plan);
      if (result !== 'success') {
        return;
      }
      confirmStarted.current = true;
      const unlocked = await waitForPremiumUnlock();
      if (unlocked) {
        finishUnlocked();
        return;
      }
      setError(t('paywall.confirmTimeout'));
    } catch (caught) {
      setError(toUserError(caught));
    } finally {
      setLoading(false);
    }
  };

  const onRestore = async (): Promise<void> => {
    setRestoring(true);
    setError(undefined);
    try {
      const unlocked = await refreshPremiumFromServer();
      if (unlocked) {
        finishUnlocked();
        return;
      }
      setError(t('paywall.restoreEmpty'));
    } catch (caught) {
      setError(toUserError(caught));
    } finally {
      setRestoring(false);
    }
  };

  return (
    <Screen>
      <Pressable accessibilityRole="button" hitSlop={12} onPress={close} style={styles.close}>
        <Ionicons color={colors.goldSoft} name="close" size={22} />
      </Pressable>

      <AppText variant="kicker" style={styles.kicker}>
        {t('paywall.kicker')}
      </AppText>
      <AppText variant="display" style={styles.title}>
        {fromForge ? t('paywall.forgeTitle') : t('paywall.title')}
      </AppText>
      <AppText variant="body" style={styles.subtitle}>
        {fromForge ? t('paywall.forgeCta') : t('paywall.subtitle')}
      </AppText>

      <View style={styles.benefits}>
        {BENEFIT_KEYS.map((item) => (
          <View key={item} style={styles.benefitRow}>
            <Ionicons color={colors.gold} name="checkmark-circle" size={20} />
            <AppText variant="body" style={styles.benefitText}>
              {t(item)}
            </AppText>
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => {
          hapticSelection();
          setPlan('lifetime');
        }}
        style={[styles.plan, plan === 'lifetime' ? styles.planSelected : null]}
      >
        <View style={styles.planHeader}>
          <AppText variant="kicker">{t('paywall.recommended')}</AppText>
          {plan === 'lifetime' ? (
            <Ionicons color={colors.gold} name="sparkles" size={18} />
          ) : null}
        </View>
        <AppText variant="title" style={styles.planTitle}>
          {t('paywall.lifetime')}
        </AppText>
        <AppText variant="number" style={styles.price}>
          {t('paywall.priceLifetime')}
        </AppText>
        <AppText variant="caption" style={styles.planHint}>
          {t('paywall.lifetimeHint')}
        </AppText>
      </Pressable>

      <Pressable
        onPress={() => {
          hapticSelection();
          setPlan('monthly');
        }}
        style={[styles.plan, plan === 'monthly' ? styles.planSelected : null]}
      >
        <AppText variant="title" style={styles.planTitle}>
          {t('paywall.monthly')}
        </AppText>
        <AppText variant="number" style={styles.price}>
          {t('paywall.priceMonthly')}
        </AppText>
        <AppText variant="caption" style={styles.planHint}>
          {t('paywall.monthlyHint')}
        </AppText>
      </Pressable>

      {confirming ? (
        <View style={styles.confirming}>
          <ActivityIndicator color={colors.gold} />
          <AppText variant="body" style={styles.confirmingText}>
            {t('paywall.confirming')}
          </AppText>
        </View>
      ) : null}

      {error !== undefined ? (
        <AppText variant="body" style={styles.error}>
          {error}
        </AppText>
      ) : null}

      <GoldButton
        disabled={busy}
        label={fromForge ? t('paywall.forgeCta') : t('paywall.cta')}
        loader="spinner"
        loading={loading || confirming}
        onPress={() => {
          void onBuy();
        }}
        style={styles.cta}
      />

      <GhostButton
        disabled={busy}
        label={t('paywall.restore')}
        onPress={() => {
          void onRestore();
        }}
        style={styles.restore}
      />
    </Screen>
  );
}

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
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
  confirming: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  confirmingText: {
    color: colors.goldSoft,
    flex: 1,
    fontSize: 14,
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
