import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TriangleCellReading } from '../../domain/numerology';
import { colors, fonts, radii } from '../../theme';
import { AppText } from '../../ui/AppText';
import { GhostButton } from '../../ui/GhostButton';

interface ArcanaBottomSheetProps {
  reading: TriangleCellReading | null;
  onClose: () => void;
}

export function ArcanaBottomSheet({ reading, onClose }: ArcanaBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const visible = reading !== null;

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.backdrop} />
        {reading !== null ? (
          <View style={[styles.sheet, { paddingBottom: Math.max(20, insets.bottom + 12) }]}>
            <View style={styles.handle} />
            <AppText variant="kicker" style={reading.blocked ? styles.kickerBlocked : undefined}>
              {sheetKicker(reading)}
            </AppText>
            <View style={styles.titleRow}>
              <View style={[styles.seal, reading.blocked ? styles.sealBlocked : styles.sealGold]}>
                <AppText
                  variant="number"
                  style={[styles.sealDigit, reading.blocked ? styles.sealDigitBlocked : null]}
                >
                  {reading.displayedDigit}
                </AppText>
              </View>
              <AppText variant="title" style={styles.title}>
                {reading.title}
              </AppText>
            </View>
            {reading.letter !== null ? (
              <AppText variant="caption" style={styles.meta}>
                Letra {reading.letter} na base da firma
              </AppText>
            ) : null}
            {reading.unreducedSum !== null ? (
              <AppText variant="caption" style={styles.meta}>
                Soma {reading.unreducedSum} reduzida a {reading.displayedDigit} neste nó
              </AppText>
            ) : null}

            <AppText variant="body" style={styles.sectionLabel}>
              Arquétipo
            </AppText>
            <AppText variant="body" style={styles.copy}>
              {reading.meaning.archetype}
            </AppText>

            <AppText variant="body" style={styles.sectionLabel}>
              Vibração no nome
            </AppText>
            <AppText variant="body" style={styles.copy}>
              {reading.meaning.nameVibration}
            </AppText>

            {reading.blocked ? (
              <View style={styles.warn}>
                <AppText variant="body" style={styles.warnText}>
                  Este nó participa de uma sequência de bloqueio. A repetição do dígito{' '}
                  {reading.displayedDigit} pede retificação da firma.
                </AppText>
              </View>
            ) : null}

            <GhostButton label="Fechar" onPress={onClose} />
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function sheetKicker(reading: TriangleCellReading): string {
  if (reading.blocked) {
    return 'Sequência de bloqueio';
  }
  if (reading.compoundArcana) {
    return 'Arcano harmônico';
  }
  return 'Nó da pirâmide';
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    backgroundColor: 'rgba(7, 4, 15, 0.72)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sheet: {
    backgroundColor: colors.ink,
    borderColor: colors.line,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    borderTopWidth: 1,
    gap: 10,
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: colors.line,
    borderRadius: radii.pill,
    height: 4,
    marginBottom: 8,
    width: 48,
  },
  kickerBlocked: {
    color: colors.danger,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  seal: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1.5,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  sealGold: {
    backgroundColor: colors.goldDim,
    borderColor: colors.gold,
  },
  sealBlocked: {
    backgroundColor: colors.dangerDim,
    borderColor: colors.danger,
  },
  sealDigit: {
    fontSize: 24,
    lineHeight: 28,
  },
  sealDigitBlocked: {
    color: colors.danger,
  },
  title: {
    flex: 1,
    fontSize: 26,
    lineHeight: 32,
  },
  meta: {
    color: colors.goldSoft,
    letterSpacing: 1,
  },
  sectionLabel: {
    color: colors.gold,
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  copy: {
    fontSize: 15,
    lineHeight: 22,
  },
  warn: {
    backgroundColor: colors.dangerDim,
    borderColor: colors.danger,
    borderRadius: radii.sm,
    borderWidth: 1,
    padding: 12,
  },
  warnText: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
});
