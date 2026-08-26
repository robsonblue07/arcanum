import { StyleSheet, View } from 'react-native';
import type { KabbalisticTriangle, NegativeSequence } from '../../domain/numerology';
import { colors, fonts } from '../../theme';
import { AppText } from '../../ui/AppText';

interface CriticalTriangleProps {
  triangle: KabbalisticTriangle;
  sequences: readonly NegativeSequence[];
  tone: 'danger' | 'gold';
}

export function CriticalTriangle({ triangle, sequences, tone }: CriticalTriangleProps) {
  const blocked = new Set(
    sequences.flatMap((sequence) =>
      sequence.cells.map((cell) => `${cell.rowIndex}:${cell.columnIndex}`),
    ),
  );
  const rows = criticalRows(triangle, blocked);
  const danger = tone === 'danger';

  return (
    <View style={styles.wrap}>
      {rows.map((row) => (
        <View key={`row-${row.rowIndex}`} style={styles.row}>
          {row.digits.map((digit, columnIndex) => {
            const marked = blocked.has(`${row.rowIndex}:${columnIndex}`);
            return (
              <View
                key={`${row.rowIndex}-${columnIndex}`}
                style={[
                  styles.node,
                  danger ? styles.nodeMuted : styles.nodeGold,
                  marked ? styles.nodeBlocked : null,
                ]}
              >
                <AppText
                  variant="number"
                  style={[
                    styles.digit,
                    danger ? styles.digitMuted : styles.digitGold,
                    marked ? styles.digitBlocked : null,
                  ]}
                >
                  {digit}
                </AppText>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function criticalRows(
  triangle: KabbalisticTriangle,
  blocked: Set<string>,
): { rowIndex: number; digits: readonly number[] }[] {
  const withBlocks = triangle.rows
    .map((digits, rowIndex) => ({ digits, rowIndex }))
    .filter((row) => row.digits.some((_, columnIndex) => blocked.has(`${row.rowIndex}:${columnIndex}`)));

  if (withBlocks.length > 0) {
    return withBlocks.slice(0, 3);
  }

  const last = triangle.rows.length - 1;
  return triangle.rows
    .map((digits, rowIndex) => ({ digits, rowIndex }))
    .filter((row) => row.rowIndex >= Math.max(0, last - 2));
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
  },
  node: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  nodeMuted: {
    backgroundColor: 'rgba(14, 8, 28, 0.55)',
    borderColor: 'rgba(232, 160, 180, 0.28)',
  },
  nodeGold: {
    backgroundColor: colors.goldDim,
    borderColor: colors.gold,
  },
  nodeBlocked: {
    backgroundColor: colors.dangerDim,
    borderColor: colors.danger,
  },
  digit: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    lineHeight: 14,
  },
  digitMuted: {
    color: colors.mist,
  },
  digitGold: {
    color: colors.goldSoft,
  },
  digitBlocked: {
    color: colors.danger,
  },
});
