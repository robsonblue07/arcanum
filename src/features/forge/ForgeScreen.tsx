import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Redirect, useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { generateGoldenNames, type ForgeKind, type GoldenName } from '../../domain/numerology';
import { hapticSuccess } from '../../lib/haptics';
import { useIsPremium } from '../../store/premium';
import { useProfileStore } from '../../store/profile-store';
import { colors, fonts, radii } from '../../theme';
import { AppText } from '../../ui/AppText';
import { Field } from '../../ui/Field';
import { GoldButton } from '../../ui/GoldButton';
import { GoldenShimmerStack } from '../../ui/GoldenShimmer';
import { Screen } from '../../ui/Screen';

const RITUAL_MS = 820;
const MAX_WORDS = 5;

export function ForgeScreen() {
  const { t } = useTranslation();
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
  const ritualRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (ritualRef.current !== null) {
        clearTimeout(ritualRef.current);
      }
    };
  }, []);

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
      setWordError(t('forge.needWord'));
      setResults(null);
      return;
    }

    const destiny = parseOptionalDestiny(destinyInput);
    if (destinyInput.trim().length > 0 && destiny === undefined) {
      setDestinyError(t('forge.destinyError'));
      return;
    }

    setWordError(undefined);
    setDestinyError(undefined);
    setForging(true);
    setResults(null);

    if (ritualRef.current !== null) {
      clearTimeout(ritualRef.current);
    }

    ritualRef.current = setTimeout(() => {
      ritualRef.current = null;
      try {
        const forged =
          destiny === undefined
            ? generateGoldenNames({ type: kind, baseWords })
            : generateGoldenNames({ type: kind, baseWords, targetDestiny: destiny });
        setResults(forged);
        hapticSuccess();
      } catch (caught) {
        setWordError(caught instanceof Error ? caught.message : t('forge.forgeFail'));
        setResults(null);
      } finally {
        setForging(false);
      }
    }, RITUAL_MS);
  };

  const onWordChange = useCallback((index: number, value: string) => {
    setWords((current) => current.map((item, i) => (i === index ? value : item)));
    setWordError(undefined);
  }, []);

  return (
    <Screen>
      <Pressable accessibilityRole="button" hitSlop={12} onPress={close} style={styles.close}>
        <Ionicons color={colors.goldSoft} name="close" size={22} />
      </Pressable>

      <AppText variant="kicker">{t('forge.kicker')}</AppText>
      <AppText variant="display" style={styles.title}>
        {t('forge.title')}
      </AppText>
      <AppText variant="body" style={styles.lead}>
        {t('forge.lead')}
      </AppText>

      <View style={styles.segment}>
        <Segment
          active={kind === 'business'}
          label={t('forge.business')}
          onPress={() => {
            setKind('business');
            setResults(null);
          }}
        />
        <Segment
          active={kind === 'baby'}
          label={t('forge.baby')}
          onPress={() => {
            setKind('baby');
            setResults(null);
          }}
        />
      </View>
      <AppText variant="caption" style={styles.segmentHint}>
        {kind === 'business' ? t('forge.businessHint') : t('forge.babyHint')}
      </AppText>

      <View style={styles.fields}>
        {words.map((word, index) => (
          <ForgeWordField
            error={index === 0 ? wordError : undefined}
            index={index}
            key={`word-${index}`}
            label={
              kind === 'business'
                ? t('forge.wordLabel', { index: index + 1 })
                : t('forge.nameLabel', { index: index + 1 })
            }
            onChange={onWordChange}
            placeholder={kind === 'business' ? t('forge.wordPlaceholder') : t('forge.namePlaceholder')}
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
            <AppText variant="caption">{t('forge.addWord')}</AppText>
          </Pressable>
        ) : null}
        <Field
          error={destinyError}
          keyboardType="number-pad"
          label={t('forge.targetDestiny')}
          onChangeText={(value) => {
            setDestinyInput(value.replace(/\D/g, '').slice(0, 2));
            setDestinyError(undefined);
          }}
          placeholder={t('forge.destinyPlaceholder')}
          value={destinyInput}
        />
      </View>

      <GoldButton
        disabled={forging}
        haptic={isPremium ? 'light' : 'warning'}
        label={t('forge.cta')}
        loading={forging}
        onPress={onForge}
        style={styles.forge}
      />

      {forging ? (
        <View style={styles.ritual}>
          <AppText variant="body" style={styles.ritualText}>
            {t('forge.ritual')}
          </AppText>
          <GoldenShimmerStack count={3} itemHeight={88} />
        </View>
      ) : null}

      {results !== null && !forging ? (
        <View style={styles.results}>
          <AppText variant="kicker">{t('forge.resultsKicker')}</AppText>
          {results.length === 0 ? (
            <AppText variant="body" style={styles.empty}>
              {t('forge.empty')}
            </AppText>
          ) : (
            results.map((item) => (
              <GoldenNameCard
                expansionLabel={t('forge.expansion')}
                freeLabel={t('forge.freeOfBlockages')}
                harmonyLabel={t('forge.harmonyGold')}
                item={item}
                key={item.name}
              />
            ))
          )}
        </View>
      ) : null}
    </Screen>
  );
}

const ForgeWordField = memo(function ForgeWordField({
  error,
  index,
  label,
  onChange,
  placeholder,
  value,
}: {
  error: string | undefined;
  index: number;
  label: string;
  onChange: (index: number, value: string) => void;
  placeholder: string;
  value: string;
}) {
  const onChangeText = useCallback(
    (next: string) => {
      onChange(index, next);
    },
    [index, onChange],
  );

  return (
    <Field
      autoCapitalize="words"
      error={error}
      label={label}
      onChangeText={onChangeText}
      placeholder={placeholder}
      value={value}
    />
  );
});

const GoldenNameCard = memo(function GoldenNameCard({
  expansionLabel,
  freeLabel,
  harmonyLabel,
  item,
}: {
  expansionLabel: string;
  freeLabel: string;
  harmonyLabel: string;
  item: GoldenName;
}) {
  const { t } = useTranslation();
  const expanding = item.apex === 8 || item.apex === 3 || item.apex === 9;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <AppText variant="signature" style={styles.cardName}>
          {item.name}
        </AppText>
        <View style={styles.apexSeal}>
          <AppText variant="caption">{t('common.apex')}</AppText>
          <AppText variant="number" style={styles.apexValue}>
            {item.apex}
          </AppText>
        </View>
      </View>
      <AppText variant="caption" style={styles.cardMeta}>
        {item.isHarmonicWithDestiny ? harmonyLabel : freeLabel}
        {expanding ? expansionLabel : ''}
      </AppText>
    </View>
  );
});

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
    gap: 16,
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
