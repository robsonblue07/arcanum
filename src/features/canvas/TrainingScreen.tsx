import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { insertTrainedSignature, isSupabaseConfigured } from '../../services';
import { toUserError } from '../../lib/to-user-error';
import { useAuthStore } from '../../store/auth-store';
import { useIsPremium } from '../../store/premium';
import { useTrainingStore } from '../../store/training-store';
import { colors, radii } from '../../theme';
import { AppText } from '../../ui/AppText';
import { GhostButton } from '../../ui/GhostButton';
import { GoldButton } from '../../ui/GoldButton';
import { Screen } from '../../ui/Screen';
import { shareSignaturePng } from './export-signature';
import { SignaturePad, type SignaturePadHandle } from './SignaturePad';

export function TrainingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const signature = useTrainingStore((state) => state.signature);
  const clearTraining = useTrainingStore((state) => state.clearTraining);
  const session = useAuthStore((state) => state.session);
  const isPremium = useIsPremium();
  const padRef = useRef<SignaturePadHandle>(null);
  const persistedRef = useRef(false);
  const [clearSignal, setClearSignal] = useState(0);
  const [strokeCount, setStrokeCount] = useState(0);
  const [hint, setHint] = useState<{ text: string; tone: 'danger' | 'success' } | undefined>();
  const [completed, setCompleted] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [saving, setSaving] = useState(false);

  const onStrokesChange = useCallback((count: number) => {
    setStrokeCount(count);
    setHint(undefined);
  }, []);

  const close = useCallback(() => {
    clearTraining();
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/signature-lab');
  }, [clearTraining, router]);

  useEffect(() => {
    if (!completed) {
      return;
    }
    const timeout = setTimeout(close, 2200);
    return () => clearTimeout(timeout);
  }, [close, completed]);

  const persistSignature = useCallback(async (): Promise<string | undefined> => {
    if (persistedRef.current || signature === null) {
      return undefined;
    }

    if (!isSupabaseConfigured()) {
      return t('train.localOnly');
    }

    const userId = session?.user.id;
    if (userId === undefined) {
      return t('train.needAccount');
    }

    await insertTrainedSignature({
      userId,
      textoAssinatura: signature,
    });
    persistedRef.current = true;
    return undefined;
  }, [session, signature, t]);

  if (signature === null) {
    return <Redirect href="/(tabs)/signature-lab" />;
  }

  if (!isPremium) {
    return <Redirect href="/paywall" />;
  }

  const onFinish = async () => {
    if (strokeCount === 0) {
      setHint({ text: t('train.traceBeforeFinish'), tone: 'danger' });
      return;
    }

    setFinishing(true);
    setHint(undefined);
    try {
      await persistSignature();
      setCompleted(true);
    } catch (caught) {
      setHint({
        text: toUserError(caught),
        tone: 'danger',
      });
    } finally {
      setFinishing(false);
    }
  };

  const onSaveImage = async () => {
    if (strokeCount === 0) {
      setHint({ text: t('train.traceBeforeSave'), tone: 'danger' });
      return;
    }

    setSaving(true);
    setHint(undefined);
    try {
      const uri = await padRef.current?.capturePng();
      if (uri === undefined) {
        throw new Error(t('train.captureError'));
      }
      await shareSignaturePng(uri);
      try {
        const warning = await persistSignature();
        setHint({
          text: warning ?? t('train.imageReady'),
          tone: warning === undefined ? 'success' : 'danger',
        });
      } catch {
        setHint({
          text: t('train.exportCloudFail'),
          tone: 'danger',
        });
      }
    } catch (caught) {
      setHint({
        text: caught instanceof Error ? caught.message : t('train.exportFail'),
        tone: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" hitSlop={12} onPress={close} style={styles.close}>
          <Ionicons color={colors.goldSoft} name="close" size={22} />
        </Pressable>
        <View style={styles.headerCopy}>
          <AppText variant="kicker">{t('train.kicker')}</AppText>
          <AppText variant="signature" style={styles.model}>
            {signature}
          </AppText>
          <AppText variant="body" style={styles.rule}>
            {t('train.rule')}
          </AppText>
        </View>
      </View>

      <View style={styles.padWrap}>
        <SignaturePad
          ref={padRef}
          clearSignal={clearSignal}
          onStrokesChange={onStrokesChange}
        />
      </View>

      {hint !== undefined ? (
        <AppText variant="body" style={[styles.hint, hint.tone === 'success' && styles.hintSuccess]}>
          {hint.text}
        </AppText>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <GhostButton
            label={t('train.clear')}
            onPress={() => {
              setClearSignal((value) => value + 1);
              persistedRef.current = false;
              setHint(undefined);
            }}
            style={styles.footerBtn}
          />
          <GoldButton
            disabled={saving}
            label={t('train.finish')}
            loading={finishing}
            onPress={() => {
              void onFinish();
            }}
            style={styles.footerBtn}
          />
        </View>
        <GoldButton
          disabled={finishing}
          label={t('train.saveImage')}
          loading={saving}
          onPress={() => {
            void onSaveImage();
          }}
          variant="secondary"
        />
      </View>

      {completed ? (
        <View style={styles.success}>
          <LinearGradient colors={['rgba(7,4,15,0.92)', 'rgba(26,15,46,0.94)']} style={styles.successCard}>
            <AppText variant="kicker">{t('train.successKicker')}</AppText>
            <AppText variant="title" style={styles.successTitle}>
              {t('train.successTitle')}
            </AppText>
            <AppText variant="body">
              {t('train.successBody')}
            </AppText>
          </LinearGradient>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  close: {
    alignItems: 'center',
    borderColor: colors.line,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerCopy: { flex: 1, gap: 6 },
  model: {
    fontSize: 28,
  },
  rule: {
    fontSize: 13,
    lineHeight: 18,
  },
  padWrap: { flex: 1, minHeight: 240 },
  hint: {
    color: colors.danger,
    fontSize: 13,
    marginTop: 10,
  },
  hintSuccess: {
    color: colors.success,
  },
  footer: {
    gap: 12,
    marginTop: 16,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  footerBtn: { flex: 1 },
  success: {
    alignItems: 'center',
    backgroundColor: 'rgba(7, 4, 15, 0.55)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: 24,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  successCard: {
    borderColor: colors.gold,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: 10,
    maxWidth: 420,
    padding: 28,
    width: '100%',
  },
  successTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
});
