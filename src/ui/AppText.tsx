import { Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';
import { colors, fonts } from '../theme';

type Variant = 'display' | 'title' | 'kicker' | 'body' | 'caption' | 'number' | 'signature';

const VARIANT_STYLE: Record<Variant, TextStyle> = {
  display: {
    color: colors.ivory,
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 46,
  },
  title: {
    color: colors.ivory,
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36,
  },
  kicker: {
    color: colors.gold,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  body: {
    color: colors.mist,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    color: colors.mist,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  number: {
    color: colors.goldSoft,
    fontFamily: fonts.bodySemi,
    fontSize: 36,
  },
  signature: {
    color: colors.ivory,
    fontFamily: fonts.displayItalic,
    fontSize: 22,
  },
};

interface AppTextProps extends TextProps {
  variant?: Variant;
  style?: StyleProp<TextStyle> | undefined;
}

export function AppText({ variant = 'body', style, ...rest }: AppTextProps) {
  return <Text {...rest} style={[VARIANT_STYLE[variant], style]} />;
}
