import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  buildKabbalisticTriangle,
  findNegativeSequences,
  generateOptimizedSignatures,
  type NegativeSequence,
  type SignatureCandidate,
} from '../../domain/numerology';
import { useProfileStore } from '../../store/profile-store';
import { colors, radii } from '../../theme';
import { GoldButton } from '../../ui/GoldButton';
import { Screen } from '../../ui/Screen';

export function SignatureLabScreen() {
  const profile = useProfileStore((state) => state.profile);

  const analysis = useMemo(() => {
    if (profile === null) {
      return null;
    }
    const triangle = buildKabbalisticTriangle(profile.fullName);
    const sequences = findNegativeSequences(triangle);
    const optimized = generateOptimizedSignatures(profile.fullName, profile.birthDate);
    return { triangle, sequences, optimized };
  }, [profile]);

  if (profile === null || analysis === null) {
    return null;
  }

  const blocked = analysis.sequences.length > 0;
  const blockedCells = new Set(
    analysis.sequences.flatMap((sequence) =>
      sequence.cells.map((cell) => `${cell.rowIndex}:${cell.columnIndex}`),
    ),
  );

  return (
    <Screen>
      <Text style={styles.kicker}>Laboratório de Assinaturas</Text>
      <Text style={styles.title}>Triângulo da Vida</Text>
      <Text style={styles.subtitle}>{profile.fullName}</Text>

      {blocked ? (
        <View style={styles.alert}>
          <Text style={styles.alertKicker}>Atenção</Text>
          <Text style={styles.alertTitle}>Bloqueio Energético Detectado</Text>
          <Text style={styles.alertCopy}>
            {formatBlockSummary(analysis.sequences)} no triângulo da sua firma atual.
          </Text>
        </View>
      ) : (
        <View style={[styles.alert, styles.alertOk]}>
          <Text style={styles.okTitle}>Assinatura em harmonia</Text>
          <Text style={styles.alertCopy}>Nenhuma sequência de 3 dígitos iguais foi encontrada.</Text>
        </View>
      )}

      <View style={styles.apexRow}>
        <Text style={styles.apexLabel}>Ápice</Text>
        <Text style={styles.apexValue}>{analysis.triangle.apex}</Text>
      </View>

      <TrianglePreview blockedCells={blockedCells} rows={analysis.triangle.rows} />

      <Text style={styles.section}>Assinaturas otimizadas</Text>
      {analysis.optimized.recommendations.length === 0 ? (
        <Text style={styles.empty}>A firma atual já é a forma mais completa do seu nome.</Text>
      ) : (
        analysis.optimized.recommendations.map((candidate) => (
          <SignatureCard candidate={candidate} key={candidate.signature} />
        ))
      )}
    </Screen>
  );
}

function formatBlockSummary(sequences: readonly NegativeSequence[]): string {
  const unique = [...new Set(sequences.map((item) => String(item.digit).repeat(item.length)))];
  if (unique.length === 1) {
    return `Sequência ${unique[0]}`;
  }
  return `Sequências ${unique.join(', ')}`;
}

interface TrianglePreviewProps {
  rows: readonly (readonly number[])[];
  blockedCells: Set<string>;
}

function TrianglePreview({ rows, blockedCells }: TrianglePreviewProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.triangleScroll}>
      <View style={styles.triangle}>
        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.triangleRow}>
            {row.map((digit, columnIndex) => {
              const blocked = blockedCells.has(`${rowIndex}:${columnIndex}`);
              return (
                <View
                  key={`${rowIndex}-${columnIndex}`}
                  style={[styles.digit, blocked ? styles.digitBlocked : null]}
                >
                  <Text style={[styles.digitText, blocked ? styles.digitTextBlocked : null]}>
                    {digit}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function SignatureCard({ candidate }: { candidate: SignatureCandidate }) {
  const [saved, setSaved] = useState(false);
  const clean = candidate.negativeSequences.length === 0;

  return (
    <View style={styles.card}>
      <Text style={styles.cardName}>{candidate.signature}</Text>
      <View style={styles.badges}>
        <Badge
          ok={clean}
          text={clean ? 'Livre de bloqueios' : `${candidate.negativeSequences.length} bloqueio(s)`}
        />
        <Badge
          ok={candidate.isHarmonicWithDestiny}
          text={
            candidate.isHarmonicWithDestiny
              ? `Ápice ${candidate.triangle.apex} harmônico`
              : `Ápice ${candidate.triangle.apex}`
          }
        />
      </View>
      <GoldButton
        label={saved ? 'Ateliê em breve' : 'Treinar esta Assinatura'}
        onPress={() => {
          setSaved(true);
          Alert.alert(
            'Ateliê de traçado',
            'O canvas de treino da nova firma abre no próximo passo. Esta variação já está selecionada.',
          );
        }}
      />
    </View>
  );
}

function Badge({ ok, text }: { ok: boolean; text: string }) {
  return (
    <View style={[styles.badge, ok ? styles.badgeOk : styles.badgeWarn]}>
      <Text style={[styles.badgeText, ok ? styles.badgeTextOk : styles.badgeTextWarn]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: colors.gold,
    fontSize: 12,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.ivory,
    fontSize: 30,
    fontWeight: '300',
    marginTop: 8,
  },
  subtitle: {
    color: colors.mist,
    marginBottom: 20,
    marginTop: 4,
  },
  alert: {
    backgroundColor: colors.dangerDim,
    borderColor: colors.danger,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: 18,
    padding: 16,
    gap: 6,
  },
  alertOk: {
    backgroundColor: colors.successDim,
    borderColor: colors.success,
  },
  alertKicker: {
    color: colors.danger,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  alertTitle: {
    color: colors.ivory,
    fontSize: 18,
    fontWeight: '600',
  },
  okTitle: {
    color: colors.success,
    fontSize: 18,
    fontWeight: '600',
  },
  alertCopy: {
    color: colors.mist,
    lineHeight: 20,
  },
  apexRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  apexLabel: {
    color: colors.mist,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  apexValue: {
    color: colors.goldSoft,
    fontSize: 28,
    fontWeight: '600',
  },
  triangleScroll: {
    marginBottom: 28,
  },
  triangle: {
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    minWidth: '100%',
    paddingVertical: 4,
  },
  triangleRow: {
    flexDirection: 'row',
    gap: 4,
  },
  digit: {
    alignItems: 'center',
    backgroundColor: colors.plum,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    height: 26,
    justifyContent: 'center',
    width: 22,
  },
  digitBlocked: {
    backgroundColor: colors.dangerDim,
    borderColor: colors.danger,
  },
  digitText: {
    color: colors.ivory,
    fontSize: 11,
  },
  digitTextBlocked: {
    color: colors.danger,
    fontWeight: '700',
  },
  section: {
    color: colors.goldSoft,
    fontSize: 13,
    letterSpacing: 2,
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  empty: {
    color: colors.mist,
  },
  card: {
    backgroundColor: 'rgba(14, 8, 28, 0.65)',
    borderColor: colors.line,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 12,
    marginBottom: 14,
    padding: 16,
  },
  cardName: {
    color: colors.ivory,
    fontSize: 20,
    fontStyle: 'italic',
  },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeOk: {
    backgroundColor: colors.successDim,
    borderColor: colors.success,
  },
  badgeWarn: {
    backgroundColor: colors.dangerDim,
    borderColor: colors.danger,
  },
  badgeText: { fontSize: 11, letterSpacing: 0.4 },
  badgeTextOk: { color: colors.success },
  badgeTextWarn: { color: colors.danger },
});
