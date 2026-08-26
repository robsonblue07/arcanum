import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import {
  calculateSynastry,
  extractLetters,
  type AffinitySeal,
  type DestinyHarmonyKind,
  type SynastryResult,
} from '../../domain/numerology';
import { brazilianDateToIso, formatDisplayDate, maskBrazilianDate } from '../../lib/dates';
import { useIsPremium } from '../../store/premium';
import { useProfileStore } from '../../store/profile-store';
import { colors, fonts, radii } from '../../theme';
import { AppText } from '../../ui/AppText';
import { Field } from '../../ui/Field';
import { GoldButton } from '../../ui/GoldButton';
import { Screen } from '../../ui/Screen';
import { CrossedTriangles } from './CrossedTriangles';

export function SynastryScreen() {
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);
  const isPremium = useIsPremium();

  const [partnerName, setPartnerName] = useState('');
  const [partnerDate, setPartnerDate] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [dateError, setDateError] = useState<string | undefined>();
  const [result, setResult] = useState<SynastryResult | null>(null);

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

  const onReveal = () => {
    const trimmed = partnerName.trim();
    const iso = brazilianDateToIso(partnerDate);
    const letters = extractLetters(trimmed);
    const nextNameError =
      letters.length < 2 ? 'Informe o nome completo de registro da outra pessoa.' : undefined;
    const nextDateError = iso === null ? 'Use o formato DD/MM/AAAA.' : undefined;

    setNameError(nextNameError);
    setDateError(nextDateError);
    if (nextNameError !== undefined || nextDateError !== undefined || iso === null) {
      setResult(null);
      return;
    }

    setResult(
      calculateSynastry(
        { name: profile.fullName, birthDate: profile.birthDate },
        { name: trimmed, birthDate: iso },
      ),
    );
  };

  const locked = result !== null && !isPremium;

  return (
    <Screen>
      <Pressable accessibilityRole="button" hitSlop={12} onPress={close} style={styles.close}>
        <Ionicons color={colors.goldSoft} name="close" size={22} />
      </Pressable>

      <AppText variant="kicker">Oráculo da Aliança</AppText>
      <AppText variant="display" style={styles.title}>
        Sinastria de Nomes
      </AppText>
      <AppText variant="body" style={styles.lead}>
        A análise completa dos 99 Arcanos Cabalísticos cruza Destino e Triângulo da Vida de duas firmas — inclusive os compostos 79 a 99. O mapa de um revela o que o outro ainda não vê.
      </AppText>

      <View style={styles.youCard}>
        <AppText variant="caption">Sua firma</AppText>
        <AppText variant="signature" style={styles.youName}>
          {profile.fullName}
        </AppText>
        <AppText variant="body" style={styles.youMeta}>
          {formatDisplayDate(profile.birthDate)}
        </AppText>
      </View>

      <View style={styles.form}>
        <Field
          autoCapitalize="words"
          error={nameError}
          label="Nome da outra pessoa"
          onChangeText={(value) => {
            setPartnerName(value);
            setNameError(undefined);
          }}
          placeholder="Nome completo de registro"
          value={partnerName}
        />
        <Field
          error={dateError}
          keyboardType="number-pad"
          label="Nascimento"
          onChangeText={(value) => {
            setPartnerDate(maskBrazilianDate(value));
            setDateError(undefined);
          }}
          placeholder="DD/MM/AAAA"
          value={partnerDate}
        />
      </View>

      <GoldButton label="Revelar a Aliança" onPress={onReveal} style={styles.reveal} />

      {result !== null ? (
        <ResultPanel
          locked={locked}
          onUnlock={() => {
            router.push('/paywall');
          }}
          result={result}
        />
      ) : null}
    </Screen>
  );
}

function ResultPanel({
  result,
  locked,
  onUnlock,
}: {
  result: SynastryResult;
  locked: boolean;
  onUnlock: () => void;
}) {
  const givenA = result.personA.normalizedName.split(/\s+/)[0] ?? result.personA.name;
  const givenB = result.personB.normalizedName.split(/\s+/)[0] ?? result.personB.name;

  return (
    <View style={styles.result}>
      <AppText variant="kicker">Afinidade</AppText>
      <AppText variant="number" style={styles.score}>
        {result.affinityScore}%
      </AppText>
      <AppText variant="caption" style={styles.harmony}>
        Destinos {harmonyLabel(result.destinyHarmony.kind)}
      </AppText>

      <View style={styles.seals}>
        {(locked ? result.seals.slice(0, 1) : result.seals).map((seal) => (
          <SealChip key={seal} seal={seal} />
        ))}
      </View>

      <View>
        <View pointerEvents={locked ? 'none' : 'auto'} style={locked ? styles.lockedInner : null}>
          <CrossedTriangles
            left={{
              label: givenA,
              sequences: result.personA.negativeSequences,
              triangle: result.personA.triangle,
            }}
            right={{
              label: givenB,
              sequences: result.personB.negativeSequences,
              triangle: result.personB.triangle,
            }}
          />

          <AppText variant="body" style={styles.synthesis}>
            {result.synthesis}
          </AppText>

          {result.sharedArcana.length > 0 ? (
            <View style={styles.arcanaBlock}>
              <AppText variant="caption">99 Arcanos Cabalísticos em comum</AppText>
              <AppText variant="body" style={styles.arcanaLine}>
                {result.sharedArcana
                  .map((item) => `${item.arcanaId} · ${item.namePt}`)
                  .join('  ·  ')}
              </AppText>
            </View>
          ) : (
            <View style={styles.arcanaBlock}>
              <AppText variant="caption">99 Arcanos Cabalísticos em comum</AppText>
              <AppText variant="body" style={styles.arcanaLine}>
                Nenhum arcano se repete na escala 1–99 deste cruzamento.
              </AppText>
            </View>
          )}

          {result.crossedBlockages.length > 0 ? (
            <View style={styles.arcanaBlock}>
              <AppText variant="caption">Bloqueios cruzados</AppText>
              <AppText variant="body" style={styles.arcanaLine}>
                {result.crossedBlockages
                  .map((item) => {
                    const from = item.from === 'A' ? givenA : givenB;
                    const onto = item.onto === 'A' ? givenA : givenB;
                    return `${from} acende o ${item.digit} em ${onto}`;
                  })
                  .join('. ')}
                .
              </AppText>
            </View>
          ) : (
            <View style={styles.arcanaBlock}>
              <AppText variant="caption">Bloqueios cruzados</AppText>
              <AppText variant="body" style={styles.arcanaLine}>
                Nenhum nome acende sequência de bloqueio no triângulo do outro.
              </AppText>
            </View>
          )}

          {result.crossedArcana.length > 0 ? (
            <View style={styles.arcanaBlock}>
              <AppText variant="caption">Arcanos cruzados (1–99)</AppText>
              <AppText variant="body" style={styles.arcanaLine}>
                {result.crossedArcana
                  .map((item) => `${item.arcanaId} · ${item.namePt}`)
                  .join('  ·  ')}
              </AppText>
            </View>
          ) : null}
        </View>

        {locked ? (
          <View style={styles.lockFooter}>
            <Ionicons color={colors.goldSoft} name="lock-closed" size={22} />
            <AppText variant="body" style={styles.lockCopy}>
              O detalhamento kármico — triângulos, os 99 Arcanos Cabalísticos e a revelação completa — pertence ao Arcanum Pro.
            </AppText>
            <GoldButton label="Desbloquear a Leitura Kármica Completa" onPress={onUnlock} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function SealChip({ seal }: { seal: AffinitySeal }) {
  return (
    <View style={styles.seal}>
      <AppText variant="caption" style={styles.sealText}>
        {seal}
      </AppText>
    </View>
  );
}

function harmonyLabel(kind: DestinyHarmonyKind): string {
  if (kind === 'harmonic') {
    return 'afins';
  }
  if (kind === 'challenging') {
    return 'desafiadores';
  }
  return 'neutros';
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
    fontSize: 36,
    lineHeight: 42,
    marginTop: 8,
  },
  lead: {
    marginTop: 12,
    marginBottom: 22,
  },
  youCard: {
    backgroundColor: 'rgba(14, 8, 28, 0.72)',
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 6,
    marginBottom: 18,
    padding: 16,
  },
  youName: {
    fontSize: 22,
  },
  youMeta: {
    fontSize: 14,
  },
  form: {
    gap: 16,
  },
  reveal: {
    marginTop: 22,
  },
  result: {
    borderColor: colors.gold,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginTop: 28,
    padding: 20,
  },
  score: {
    fontFamily: fonts.displayBold,
    fontSize: 64,
    lineHeight: 72,
    marginTop: 8,
  },
  harmony: {
    color: colors.goldSoft,
    marginBottom: 16,
  },
  seals: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  seal: {
    backgroundColor: colors.goldDim,
    borderColor: colors.gold,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sealText: {
    color: colors.goldSoft,
    letterSpacing: 1,
  },
  lockedInner: {
    opacity: 0.28,
    ...(Platform.OS === 'web' ? { filter: 'blur(7px)' } : null),
  },
  lockFooter: {
    alignItems: 'center',
    backgroundColor: 'rgba(7, 4, 15, 0.72)',
    borderColor: colors.gold,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 14,
    marginTop: 16,
    padding: 16,
  },
  lockCopy: {
    color: colors.ivory,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  synthesis: {
    color: colors.ivory,
    fontFamily: fonts.displayItalic,
    fontSize: 18,
    lineHeight: 28,
    marginTop: 12,
  },
  arcanaBlock: {
    gap: 6,
    marginTop: 16,
  },
  arcanaLine: {
    fontSize: 15,
    lineHeight: 22,
  },
});
