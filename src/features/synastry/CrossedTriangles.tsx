import { StyleSheet, View } from 'react-native';
import type { KabbalisticTriangle, NegativeSequence } from '../../domain/numerology';
import { colors, fonts } from '../../theme';
import { AppText } from '../../ui/AppText';

interface ApexPyramidProps {
  label: string;
  triangle: KabbalisticTriangle;
  sequences: readonly NegativeSequence[];
}

export function CrossedTriangles({
  left,
  right,
}: {
  left: ApexPyramidProps;
  right: ApexPyramidProps;
}) {
  return (
    <View style={styles.wrap}>
      <ApexPyramid {...left} />
      <View style={styles.axis}>
        <View style={styles.axisLine} />
        <AppText variant="caption" style={styles.axisMark}>
          ×
        </AppText>
        <View style={styles.axisLine} />
      </View>
      <ApexPyramid {...right} />
    </View>
  );
}

function ApexPyramid({ label, triangle, sequences }: ApexPyramidProps) {
  const blocked = new Set(
    sequences.flatMap((sequence) =>
      sequence.cells.map((cell) => `${cell.rowIndex}:${cell.columnIndex}`),
    ),
  );
  const last = triangle.rows.length - 1;
  const rows = triangle.rows
    .map((digits, rowIndex) => ({ digits, rowIndex }))
    .filter((row) => row.rowIndex >= Math.max(0, last - 3));

  return (
    <View style={styles.pyramid}>
      <AppText variant="caption" style={styles.label} numberOfLines={1}>
        {label}
      </AppText>
      {rows.map((row) => (
        <View key={`row-${row.rowIndex}`} style={styles.row}>
          {row.digits.map((digit, columnIndex) => {
            const marked = blocked.has(`${row.rowIndex}:${columnIndex}`);
            const apex = row.rowIndex === last && row.digits.length === 1;
            return (
              <View
                key={`${row.rowIndex}-${columnIndex}`}
                style={[styles.node, marked ? styles.nodeBlocked : styles.nodeGold, apex && styles.nodeApex]}
              >
                <AppText
                  variant="number"
                  style={[styles.digit, marked ? styles.digitBlocked : styles.digitGold]}
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

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  axis: {
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    paddingTop: 18,
  },
  axisLine: {
    backgroundColor: colors.gold,
    height: 18,
    opacity: 0.45,
    width: 1,
  },
  axisMark: {
    color: colors.goldSoft,
    fontSize: 18,
    letterSpacing: 0,
  },
  pyramid: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  label: {
    marginBottom: 6,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    justifyContent: 'center',
  },
  node: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  nodeGold: {
    backgroundColor: colors.goldDim,
    borderColor: colors.gold,
  },
  nodeBlocked: {
    backgroundColor: colors.dangerDim,
    borderColor: colors.danger,
  },
  nodeApex: {
    borderWidth: 1.5,
    height: 26,
    width: 26,
  },
  digit: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    lineHeight: 12,
  },
  digitGold: {
    color: colors.goldSoft,
  },
  digitBlocked: {
    color: colors.danger,
  },
});
