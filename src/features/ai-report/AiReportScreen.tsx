import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import type { CanonicalReportPayload } from '../../domain/numerology';
import { generateGrimoirePdf, shareGrimoirePdf } from '../../lib/pdf-generator';
import { toUserError } from '../../lib/to-user-error';
import {
  assembleCanonicalReport,
  generateAiGrimoire,
  isOpenAiConfigured,
  type GrimoireChapter,
} from '../../services';
import { useIsPremium } from '../../store/premium';
import { useProfileStore } from '../../store/profile-store';
import { colors, fonts, radii } from '../../theme';
import { AppText } from '../../ui/AppText';
import { GoldButton } from '../../ui/GoldButton';
import { Screen } from '../../ui/Screen';

const TRANSMUTATION = [
  'Abrindo o grimório no véu da meia-luz…',
  'Varredura dos 99 Arcanos no Triângulo da Vida…',
  'O Mestre lê o Destino sem inventar um só número…',
  'Rompimento dos selos 111 a 999…',
  'A nova firma próspera é escrita em ouro…',
  'Selando o PDF com a geometria do Arcanum…',
] as const;

export function AiReportScreen() {
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);
  const isPremium = useIsPremium();
  const [compiling, setCompiling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [error, setError] = useState<string | undefined>();
  const [chapters, setChapters] = useState<readonly GrimoireChapter[] | null>(null);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const payload = useMemo((): CanonicalReportPayload | null => {
    if (profile === null) {
      return null;
    }
    return assembleCanonicalReport({
      fullName: profile.fullName,
      birthDate: profile.birthDate,
    });
  }, [profile]);

  useEffect(() => {
    if (!compiling) {
      return;
    }
    const tick = setInterval(() => {
      setProgress((current) => Math.min(92, current + 4));
      setPhraseIndex((current) => (current + 1) % TRANSMUTATION.length);
    }, 900);
    return () => {
      clearInterval(tick);
    };
  }, [compiling]);

  if (profile === null || payload === null) {
    return <Redirect href="/" />;
  }

  const close = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/dashboard');
  };

  const compile = async (): Promise<void> => {
    setCompiling(true);
    setError(undefined);
    setProgress(8);
    setPhraseIndex(0);
    setChapters(null);
    setPdfUri(null);
    try {
      const grimoire = await generateAiGrimoire({
        fullName: profile.fullName,
        birthDate: profile.birthDate,
      });
      setProgress(88);
      const printed = await generateGrimoirePdf(grimoire.payload, grimoire.chapters);
      setChapters(grimoire.chapters);
      setPdfUri(printed.uri);
      setProgress(100);
    } catch (caught) {
      setError(toUserError(caught));
    } finally {
      setCompiling(false);
    }
  };

  const locked = !isPremium;

  return (
    <Screen>
      <Pressable accessibilityRole="button" hitSlop={12} onPress={close} style={styles.close}>
        <Ionicons color={colors.goldSoft} name="close" size={22} />
      </Pressable>

      <AppText variant="kicker">Grimório Pessoal</AppText>
      <AppText variant="display" style={styles.title}>
        Relatório Cabalístico IA
      </AppText>
      <AppText variant="body" style={styles.lead}>
        A prosa é do Mestre. Os números — Destino {payload.triad.destiny}, Missão{' '}
        {payload.triad.mission}, ápice {payload.triad.apex} — vêm só dos motores do Arcanum.
      </AppText>

      <View style={styles.summary}>
        <AppText variant="caption">Sumário canônico</AppText>
        <AppText variant="body" style={styles.summaryLine}>
          {payload.person.fullName} · {payload.person.birthDate}
        </AppText>
        <AppText variant="body" style={styles.summaryLine}>
          Firma atual {payload.originalSignature.signature}
          {payload.pyramid.blockageCodes.length > 0
            ? ` · bloqueios ${payload.pyramid.blockageCodes.join(', ')}`
            : ' · sem sequência 111–999'}
        </AppText>
        <AppText variant="body" style={styles.summaryLine}>
          Firma retificada {payload.rectifiedSignature.signature} · ápice{' '}
          {payload.rectifiedSignature.apex}
        </AppText>
        <AppText variant="body" style={styles.summaryLine}>
          Dia Pessoal {payload.oracle.personalDay} — {payload.oracle.title}
        </AppText>
      </View>

      {locked ? (
        <View style={styles.lockFooter}>
          <Ionicons color={colors.goldSoft} name="lock-closed" size={22} />
          <AppText variant="body" style={styles.lockCopy}>
            O grimório completo em PDF — quatro capítulos e o selo de conclusão — pertence ao
            Arcanum Pro.
          </AppText>
          <GoldButton
            label="Desbloquear o Grimório"
            onPress={() => {
              router.push('/paywall');
            }}
          />
        </View>
      ) : (
        <>
          {!isOpenAiConfigured() ? (
            <AppText variant="body" style={styles.warn}>
              Configure EXPO_PUBLIC_OPENAI_API_KEY no .env para o Mestre escrever a prosa.
            </AppText>
          ) : null}

          <GoldButton
            disabled={compiling}
            label="Compilar Meu Grimório em PDF"
            loading={compiling}
            onPress={() => {
              void compile();
            }}
            style={styles.compile}
          />
        </>
      )}

      {compiling ? (
        <View style={styles.ritual}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress}%` }]} />
          </View>
          <AppText variant="body" style={styles.phrase}>
            {TRANSMUTATION[phraseIndex] ?? TRANSMUTATION[0]}
          </AppText>
        </View>
      ) : null}

      {error !== undefined ? (
        <AppText variant="body" style={styles.error}>
          {error}
        </AppText>
      ) : null}

      {chapters !== null ? (
        <View style={styles.preview}>
          <AppText variant="kicker">Pré-visualização</AppText>
          {chapters.map((chapter) => (
            <View key={chapter.number} style={styles.previewCard}>
              <AppText variant="caption">Capítulo {chapter.number}</AppText>
              <AppText variant="title" style={styles.previewTitle}>
                {chapter.title}
              </AppText>
              <AppText variant="body" numberOfLines={5} style={styles.previewBody}>
                {chapter.body}
              </AppText>
            </View>
          ))}
          <GoldButton
            disabled={sharing}
            label={
              sharing
                ? 'Abrindo compartilhamento...'
                : pdfUri === null
                  ? 'Imprimir / salvar PDF de novo'
                  : 'Baixar / Compartilhar PDF'
            }
            onPress={() => {
              void (async () => {
                setSharing(true);
                setError(undefined);
                try {
                  if (pdfUri !== null) {
                    await shareGrimoirePdf(pdfUri);
                    return;
                  }
                  await generateGrimoirePdf(payload, chapters);
                } catch (caught) {
                  setError(toUserError(caught));
                } finally {
                  setSharing(false);
                }
              })();
            }}
            style={styles.share}
          />
        </View>
      ) : null}
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
  title: {
    fontSize: 34,
    lineHeight: 40,
    marginTop: 8,
  },
  lead: {
    marginTop: 12,
    marginBottom: 20,
  },
  summary: {
    backgroundColor: 'rgba(14, 8, 28, 0.72)',
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 8,
    marginBottom: 22,
    padding: 16,
  },
  summaryLine: {
    fontSize: 15,
    lineHeight: 22,
  },
  lockFooter: {
    alignItems: 'center',
    backgroundColor: 'rgba(7, 4, 15, 0.72)',
    borderColor: colors.gold,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  lockCopy: {
    color: colors.ivory,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  warn: {
    color: colors.goldSoft,
    fontSize: 14,
    marginBottom: 12,
  },
  compile: {
    marginBottom: 18,
  },
  ritual: {
    gap: 12,
    marginBottom: 18,
  },
  track: {
    backgroundColor: colors.goldDim,
    borderColor: colors.gold,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 10,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: colors.gold,
    height: '100%',
  },
  phrase: {
    color: colors.goldSoft,
    fontFamily: fonts.displayItalic,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  preview: {
    gap: 14,
    marginTop: 8,
  },
  previewCard: {
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  previewTitle: {
    fontSize: 20,
    lineHeight: 26,
  },
  previewBody: {
    fontSize: 15,
    lineHeight: 22,
  },
  share: {
    marginTop: 8,
  },
});
