import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { colors } from '../../theme';
import { captureSignaturePng } from './export-signature';
import {
  MIN_POINT_DISTANCE,
  SIGNATURE_STROKE_WIDTH,
  computeGuide,
  distance,
  toSvgPath,
  type Stroke,
} from './signature-geometry';

interface SignaturePadProps {
  onStrokesChange?: ((count: number) => void) | undefined;
  clearSignal: number;
}

export interface SignaturePadHandle {
  capturePng: () => Promise<string>;
}

export const SignaturePad = memo(
  forwardRef<SignaturePadHandle, SignaturePadProps>(function SignaturePad(
    { onStrokesChange, clearSignal },
    ref,
  ) {
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const currentStroke = useRef<Stroke>([]);
    const strokesRef = useRef<Stroke[]>([]);
    const sizeRef = useRef(size);
    const captureRef = useRef<View>(null);
    const frame = useRef<number | null>(null);

    sizeRef.current = size;

    useEffect(() => {
      strokesRef.current = [];
      currentStroke.current = [];
      setStrokes([]);
      onStrokesChange?.(0);
    }, [clearSignal, onStrokesChange]);

    const flush = useCallback(() => {
      frame.current = null;
      setStrokes([...strokesRef.current]);
    }, []);

    const scheduleFlush = useCallback(() => {
      if (frame.current !== null) {
        return;
      }
      frame.current = requestAnimationFrame(flush);
    }, [flush]);

    const emitCount = useCallback(
      (count: number) => {
        onStrokesChange?.(count);
      },
      [onStrokesChange],
    );

    useImperativeHandle(
      ref,
      () => ({
        capturePng: async () => {
          flush();
          await waitForPaint();
          return captureSignaturePng({
            viewRef: captureRef,
            strokes: strokesRef.current,
            width: sizeRef.current.width,
            height: sizeRef.current.height,
          });
        },
      }),
      [flush],
    );

    useEffect(() => {
      return () => {
        if (frame.current !== null) {
          cancelAnimationFrame(frame.current);
          frame.current = null;
        }
      };
    }, []);

    const panResponder = useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: () => true,
          onPanResponderGrant: (event) => {
            const next = {
              x: event.nativeEvent.locationX,
              y: event.nativeEvent.locationY,
            };
            currentStroke.current = [next];
            strokesRef.current = [...strokesRef.current, currentStroke.current];
            scheduleFlush();
          },
          onPanResponderMove: (event) => {
            const stroke = currentStroke.current;
            const last = stroke[stroke.length - 1];
            const next = {
              x: event.nativeEvent.locationX,
              y: event.nativeEvent.locationY,
            };
            if (last !== undefined && distance(last, next) < MIN_POINT_DISTANCE) {
              return;
            }
            stroke.push(next);
            scheduleFlush();
          },
          onPanResponderRelease: () => {
            emitCount(strokesRef.current.length);
            scheduleFlush();
          },
          onPanResponderTerminate: () => {
            emitCount(strokesRef.current.length);
            scheduleFlush();
          },
        }),
      [emitCount, scheduleFlush],
    );

    const onLayout = (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setSize({ width, height });
    };

    const guide = useMemo(() => computeGuide(size.width, size.height), [size]);

    return (
      <View {...panResponder.panHandlers} collapsable={false} onLayout={onLayout} style={styles.board}>
        {size.width > 0 ? (
          <>
            <Svg height={size.height} pointerEvents="none" width={size.width}>
              {guide !== null ? (
                <Line
                  stroke={colors.gold}
                  strokeDasharray="7 9"
                  strokeOpacity={0.55}
                  strokeWidth={1.5}
                  x1={guide.x1}
                  x2={guide.x2}
                  y1={guide.y1}
                  y2={guide.y2}
                />
              ) : null}
            </Svg>
            <View
              collapsable={false}
              pointerEvents="none"
              ref={captureRef}
              style={[styles.capture, { height: size.height, width: size.width }]}
            >
              <Svg height={size.height} width={size.width}>
                {strokes.map((stroke, index) => (
                  <Path
                    d={toSvgPath(stroke)}
                    fill="none"
                    key={`stroke-${index}`}
                    stroke={colors.gold}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={SIGNATURE_STROKE_WIDTH}
                  />
                ))}
              </Svg>
            </View>
          </>
        ) : null}
      </View>
    );
  }),
);

SignaturePad.displayName = 'SignaturePad';

function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: 'rgba(7, 4, 15, 0.55)',
    borderColor: colors.line,
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    overflow: 'hidden',
  },
  capture: {
    backgroundColor: 'transparent',
    left: 0,
    position: 'absolute',
    top: 0,
  },
});
