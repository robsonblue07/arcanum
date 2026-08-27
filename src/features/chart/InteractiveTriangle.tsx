import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import {
  readTriangleCell,
  type KabbalisticTriangle,
  type NegativeSequence,
  type TriangleCellReading,
} from '../../domain/numerology';
import { colors, fonts } from '../../theme';
import { AppText } from '../../ui/AppText';
import { ArcanaBottomSheet } from './ArcanaBottomSheet';

const NODE_SPRING = { damping: 16, stiffness: 220, mass: 0.8 } as const;

interface InteractiveTriangleProps {
  triangle: KabbalisticTriangle;
  sequences: readonly NegativeSequence[];
  density?: 'compact' | 'comfortable' | undefined;
  showBaseLetters?: boolean | undefined;
}

export const InteractiveTriangle = memo(function InteractiveTriangle({
  triangle,
  sequences,
  density = 'compact',
  showBaseLetters = false,
}: InteractiveTriangleProps) {
  const [reading, setReading] = useState<TriangleCellReading | null>(null);
  const comfortable = density === 'comfortable';
  const blockedCells = useMemo(
    () =>
      new Set(
        sequences.flatMap((sequence) =>
          sequence.cells.map((cell) => `${cell.rowIndex}:${cell.columnIndex}`),
        ),
      ),
    [sequences],
  );
  const compoundCells = useMemo(
    () =>
      new Set(triangle.arcanumHits.map((hit) => `${hit.rowIndex}:${hit.columnIndex}`)),
    [triangle.arcanumHits],
  );

  const onSelectCell = useCallback(
    (rowIndex: number, columnIndex: number, blocked: boolean) => {
      const next = readTriangleCell(triangle, rowIndex, columnIndex, blocked);
      if (next !== null) {
        setReading(next);
      }
    },
    [triangle],
  );

  const onCloseReading = useCallback(() => {
    setReading(null);
  }, []);

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.triangle}>
          {showBaseLetters ? (
            <View style={styles.row}>
              {triangle.letters.map((letter, index) => (
                <View
                  key={`letter-${letter}-${index}`}
                  style={[styles.letterSlot, comfortable ? styles.letterSlotLg : styles.letterSlotSm]}
                >
                  <AppText
                    variant="caption"
                    style={[styles.letter, comfortable ? styles.letterLg : null]}
                  >
                    {letter}
                  </AppText>
                </View>
              ))}
            </View>
          ) : null}
          {triangle.rows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((digit, columnIndex) => {
                const key = `${rowIndex}:${columnIndex}`;
                const blocked = blockedCells.has(key);
                return (
                  <TriangleNode
                    accessibilityLabel={`Número ${digit}, linha ${rowIndex + 1}`}
                    blocked={blocked}
                    columnIndex={columnIndex}
                    comfortable={comfortable}
                    compound={compoundCells.has(key) && !blocked}
                    digit={digit}
                    key={key}
                    onSelect={onSelectCell}
                    rowIndex={rowIndex}
                    selected={
                      reading?.rowIndex === rowIndex && reading.columnIndex === columnIndex
                    }
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
      <ArcanaBottomSheet onClose={onCloseReading} reading={reading} />
    </>
  );
});

const TriangleNode = memo(function TriangleNode({
  accessibilityLabel,
  blocked,
  columnIndex,
  comfortable,
  compound,
  digit,
  onSelect,
  rowIndex,
  selected,
}: {
  accessibilityLabel: string;
  blocked: boolean;
  columnIndex: number;
  comfortable: boolean;
  compound: boolean;
  digit: number;
  onSelect: (rowIndex: number, columnIndex: number, blocked: boolean) => void;
  rowIndex: number;
  selected: boolean;
}) {
  const scale = useSharedValue(1);
  const onPress = useCallback(() => {
    onSelect(rowIndex, columnIndex, blocked);
  }, [blocked, columnIndex, onSelect, rowIndex]);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.08 : 1, NODE_SPRING);
  }, [scale, selected]);

  const springStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={springStyle}>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.node,
          comfortable ? styles.nodeLg : styles.nodeSm,
          blocked ? styles.nodeBlocked : styles.nodeGold,
          compound ? styles.nodeCompound : null,
          pressed && styles.nodePressed,
        ]}
      >
        <AppText
          variant="number"
          style={[
            styles.digit,
            comfortable ? styles.digitLg : styles.digitSm,
            blocked ? styles.digitBlocked : styles.digitGold,
          ]}
        >
          {digit}
        </AppText>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  scroll: {
    marginBottom: 8,
  },
  triangle: {
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    minWidth: '100%',
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  letterSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterSlotSm: {
    width: 28,
  },
  letterSlotLg: {
    width: 42,
  },
  letter: {
    color: colors.goldSoft,
    letterSpacing: 0.5,
  },
  letterLg: {
    fontSize: 13,
  },
  node: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1.5,
    justifyContent: 'center',
  },
  nodeSm: {
    height: 28,
    width: 28,
  },
  nodeLg: {
    height: 42,
    width: 42,
  },
  nodeGold: {
    backgroundColor: colors.goldDim,
    borderColor: colors.gold,
  },
  nodeCompound: {
    shadowColor: colors.gold,
    shadowOpacity: 0.65,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  nodeBlocked: {
    backgroundColor: colors.dangerDim,
    borderColor: colors.danger,
  },
  nodePressed: {
    opacity: 0.82,
  },
  digit: {
    fontFamily: fonts.bodySemi,
  },
  digitSm: {
    fontSize: 12,
    lineHeight: 16,
  },
  digitLg: {
    fontSize: 16,
    lineHeight: 20,
  },
  digitGold: {
    color: colors.goldSoft,
  },
  digitBlocked: {
    color: colors.danger,
  },
});
