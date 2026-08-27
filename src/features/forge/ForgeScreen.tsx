import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Redirect, useRouter, type Href } from 'expo-router';
import {
  generateGoldenNames,
  type ForgeKind,
  type GoldenName,
} from '../../domain/numerology';
import { useIsPremium } from '../../store/premium';
import { useProfileStore } from '../../store/profile-store';
import { colors, fonts, radii } from '../../theme';
import { AppText } from '../../ui/AppText';
import { Field } from '../../ui/Field';
import { GoldButton } from '../../ui/GoldButton';
import { Screen } from '../../ui/Screen';

const RITUAL_MS = 820;
const MAX_WORDS = 5;

export function ForgeScreen() {
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);
  const isPremium = useIsPremium();
  const [kind, setKind] = useState<ForgeKind>('business');
  const [words, setWords] = useState(['', '', '']);
  const [destinyInput, setDestinyInput] = useState('');
  const [wordError, setWordError] = useState<string | undefined>();
  const [destinyError, setDestinyError] = useState<string | undefined>();
  const [forging, setForging] = useState(false);
  const [results, setResults] = useState<readonly GoldenName[] | null>(null);

  if (profile === null) {
    return <Redirect href="/" />;
  }

  const close = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/dashboard');
  };

  const onForge = () => {
    if (!isPremium) {
      router.push('/paywall?intent=forge' as Href);
      return;
    }

    const baseWords = words.map((item) => item.trim()).filter((item) => item.length > 0);
    if (baseWords.length === 0) {
      setWordError('Informe ao menos uma palavra-chave.');
      setResults(null);
      return;
    }

    const destiny = parseOptionalDestiny(destinyInput);
    if (destinyInput.trim().length > 0 && destiny === undefined) {
      setDestinyError('Use 1–9, ou os mestres 11, 22, 33.');
      return;
    }

    setWordError(undefined);
    setDestinyError(undefined);
    setForging(true);
    setResults(null);

    setTimeout(() => {
      try {
        const forged =
          destiny === undefined
            ? generateGoldenNames({ type: kind, baseWords })
            : generateGoldenNames({ type: kind, baseWords, targetDestiny: destiny });
        setResults(forged);
      } catch (caught) {
        setWordError(caught instanceof Error ? caught.message : 'Não foi possível forjar.');
        setResults(null);
      } finally {
        setForging(false);
      }
    }, RITUAL_MS);
  };

  return (
    <Screen>
      <Pressable accessibilityRole="button" hitSlop={12} onPress={close} style={styles.close}>
        <Ionicons color={colors.goldSoft} name="close" size={22} />
      </Pressable>

      <AppText variant="kicker">A Forja Cabalística</AppText>
      <AppText variant="display" style={styles.title}>
        Gerador de Marcas e Bebês
      </AppText>
      <AppText variant="body" style={styles.lead}>
        O motor permuta palavras e partículas, calcula o Triângulo da Vida e descarta na hora
        qualquer nome com bloqueio 111–999. Só o ouro sobrevive.
      </AppText>

      <View style={styles.segment}>
        <Segment
          active={kind === 'business'}
          label="Arcanum Business"
          onPress={() => {
            setKind('business');
            setResults(null);
          }}
        />
        <Segment
          active={kind === 'baby'}
          label="Arcanum Baby"
          onPress={() => {
            setKind('baby');
            setResults(null);
          }}
        />
      </View>
      <AppText variant="caption" style={styles.segmentHint}>
        {kind === 'business' ? 'Empresas e marcas' : 'Bebês e nomes de registro'}
      </AppText>

      <View style={styles.fields}>
        {words.map((word, index) => (
          <Field
            key={`word-${index}`}
            autoCapitalize="words"
            error={index === 0 ? wordError : undefined}
            label={kind === 'business' ? `Palavra ${index + 1}` : `Nome ${index + 1}`}
            onChangeText={(value) => {
              setWords((current) => current.map((item, i) => (i === index ? value : item)));
              setWordError(undefined);
            }}
            placeholder={kind === 'business' ? 'Ex: Luz, Sol, Ouro' : 'Ex: Maria, Silva, Costa'}
            value={word}
          />
        ))}
        {words.length < MAX_WORDS ? (
          <Pressable
            onPress={() => {
              setWords((current) => [...current, '']);
            }}
            style={styles.addWord}
          >
            <AppText variant="caption">Adicionar palavra</AppText>
          </Pressable>
        ) : null}
        <Field
          error={destinyError}
          keyboardType="number-pad"
          label="Destino-alvo (opcional)"
          onChangeText={(value) => {
            setDestinyInput(value.replace(/\D/g, '').slice(0, 2));
            setDestinyError(undefined);
          }}
          placeholder="1–9, 11, 22 ou 33"
          value={destinyInput}
        />
      </View>

      <GoldButton
        disabled={forging}
        label="Forjar Nomes de Ouro"
        loading={forging}
        onPress={onForge}
        style={styles.forge}
      />

      {forging ? (
        <View style={styles.ritual}>
          <AppText variant="body" style={styles.ritualText}>
            A forja aquece. Permutações, partículas, triângulos — o ferro impuro cai.
          </AppText>
        </View>
      ) : null}

      {results !== null && !forging ? (
        <View style={styles.results}>
          <AppText variant="kicker">Nomes de ouro</AppText>
          {results.length === 0 ? (
            <AppText variant="body" style={styles.empty}>
              Nenhuma combinação sobreviveu ao filtro de bloqueios. Troque uma palavra e forje de novo.
            </AppText>
          ) : (
            results.map((item) => (
              <View key={item.name} style={styles.card}>
                <View style={styles.cardHeader}>
                  <AppText variant="signature" style={styles.cardName}>
                    {item.name}
                  </AppText>
                  <View style={styles.apexSeal}>
                    <AppText variant="caption">Ápice</AppText>
                    <AppText variant="number" style={styles.apexValue}>
                      {item.apex}
                    </AppText>
                  </View>
                </View>
                <AppText variant="caption" style={styles.cardMeta}>
                  {item.isHarmonicWithDestiny ? 'Harmonia de ouro' : 'Livre de bloqueios'}
                  {item.apex === 8 || item.apex === 3 || item.apex === 9
                    ? ' · expansão 8 · 3 · 9'
                    : ''}
                </AppText>
              </View>
            ))
          )}
        </View>
      ) : null}
    </Screen>
  );
}

function Segment({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.segmentItem, active ? styles.segmentItemActive : null]}
    >
      <AppText variant="caption" style={active ? styles.segmentLabelOn : styles.segmentLabelOff}>
        {label}
      </AppText>
    </Pressable>
  );
}

function parseOptionalDestiny(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  const value = Number(trimmed);
  if (value === 11 || value === 22 || value === 33) {
    return value;
  }
  if (Number.isInteger(value) && value >= 1 && value <= 9) {
    return value;
  }
  return undefined;
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
  segment: {
    backgroundColor: 'rgba(14, 8, 28, 0.72)',
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 4,
  },
  segmentItem: {
    alignItems: 'center',
    borderRadius: radii.sm,
    flex: 1,
    paddingVertical: 12,
  },
  segmentItemActive: {
    backgroundColor: colors.goldDim,
    borderColor: colors.gold,
    borderWidth: 1,
  },
  segmentLabelOn: {
    color: colors.goldSoft,
  },
  segmentLabelOff: {
    color: colors.mist,
  },
  segmentHint: {
    marginTop: 8,
    marginBottom: 18,
    textAlign: 'center',
  },
  fields: {
    gap: 14,
  },
  addWord: {
    alignItems: 'center',
    borderColor: colors.line,
    borderRadius: radii.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    paddingVertical: 12,
  },
  forge: {
    marginTop: 22,
  },
  ritual: {
    marginTop: 18,
  },
  ritualText: {
    color: colors.goldSoft,
    fontFamily: fonts.displayItalic,
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
  },
  results: {
    gap: 12,
    marginTop: 26,
  },
  empty: {
    marginTop: 8,
  },
  card: {
    backgroundColor: 'rgba(14, 8, 28, 0.72)',
    borderColor: colors.gold,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: 16,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  cardName: {
    flex: 1,
    fontSize: 22,
  },
  apexSeal: {
    alignItems: 'center',
    borderColor: colors.gold,
    borderRadius: radii.pill,
    borderWidth: 1,
    minWidth: 64,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  apexValue: {
    fontSize: 22,
    lineHeight: 26,
  },
  cardMeta: {
    color: colors.goldSoft,
    marginTop: 10,
  },
});
