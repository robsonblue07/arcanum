import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TriangleCellReading } from '../../domain/numerology';
import { hapticLight } from '../../lib/haptics';
import { colors, fonts, radii } from '../../theme';
import { AppText } from '../../ui/AppText';
import { GhostButton } from '../../ui/GhostButton';

interface ArcanaBottomSheetProps {
  reading: TriangleCellReading | null;
  onClose: () => void;
}

const SPRING = { damping: 18, stiffness: 240, mass: 0.86 } as const;

export function ArcanaBottomSheet({ reading, onClose }: ArcanaBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const [held, setHeld] = useState<TriangleCellReading | null>(reading);
  const translateY = useSharedValue(420);
  const overlay = useSharedValue(0);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (reading === null) {
      return;
    }
    hapticLight();
    setHeld(reading);
    overlay.value = withTiming(1, { duration: 180 });
    translateY.value = 36;
    translateY.value = withSpring(0, SPRING);
  }, [overlay, reading, translateY]);

  const finishClose = useCallback((): void => {
    setHeld(null);
    onCloseRef.current();
  }, []);

  const dismiss = (): void => {
    overlay.value = withTiming(0, { duration: 160 });
    translateY.value = withSpring(420, { damping: 20, stiffness: 190, mass: 0.9 }, (finished) => {
      if (finished) {
        runOnJS(finishClose)();
      }
    });
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlay.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const visible = held !== null;
  const shown = held;

  return (
    <Modal
      animationType="none"
      onRequestClose={dismiss}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdropFill, overlayStyle]}>
          <Pressable accessibilityRole="button" onPress={dismiss} style={styles.backdrop} />
        </Animated.View>
        {shown !== null ? (
          <Animated.View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(20, insets.bottom + 12) },
              sheetStyle,
            ]}
          >
            <View style={styles.handle} />
            <AppText variant="kicker" style={shown.blocked ? styles.kickerBlocked : undefined}>
              {sheetKicker(shown)}
            </AppText>
            <View style={styles.titleRow}>
              <View style={[styles.seal, shown.blocked ? styles.sealBlocked : styles.sealGold]}>
                <AppText
                  variant="number"
                  style={[styles.sealDigit, shown.blocked ? styles.sealDigitBlocked : null]}
                >
                  {shown.displayedDigit}
                </AppText>
              </View>
              <AppText variant="title" style={styles.title}>
                {shown.title}
              </AppText>
            </View>
            {shown.letter !== null ? (
              <AppText variant="caption" style={styles.meta}>
                Letra {shown.letter} na base da firma
              </AppText>
            ) : null}
            {shown.unreducedSum !== null ? (
              <AppText variant="caption" style={styles.meta}>
                Soma {shown.unreducedSum} reduzida a {shown.displayedDigit} neste nó
              </AppText>
            ) : null}

            <AppText variant="body" style={styles.sectionLabel}>
              Arquétipo
            </AppText>
            <AppText variant="body" style={styles.copy}>
              {shown.meaning.archetype}
            </AppText>

            <AppText variant="body" style={styles.sectionLabel}>
              Vibração no nome
            </AppText>
            <AppText variant="body" style={styles.copy}>
              {shown.meaning.nameVibration}
            </AppText>

            {shown.blocked ? (
              <View style={styles.warn}>
                <AppText variant="body" style={styles.warnText}>
                  Este nó participa de uma sequência de bloqueio. A repetição do dígito{' '}
                  {shown.displayedDigit} pede retificação da firma.
                </AppText>
              </View>
            ) : null}

            <GhostButton label="Fechar" onPress={dismiss} />
          </Animated.View>
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
  backdropFill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(7, 4, 15, 0.72)',
  },
  backdrop: {
    flex: 1,
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
