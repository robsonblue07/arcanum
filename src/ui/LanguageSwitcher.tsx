import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeAppLanguage, getActiveLanguage, type AppLanguage } from '../lib/i18n';
import { colors, fonts, radii } from '../theme';
import { AppText } from './AppText';

const OPTIONS: readonly { code: AppLanguage; sigla: string; flag: string; labelKey: string }[] = [
  { code: 'pt-BR', sigla: 'PT', flag: '🇧🇷', labelKey: 'language.pt' },
  { code: 'en-US', sigla: 'EN', flag: '🇺🇸', labelKey: 'language.en' },
  { code: 'es-ES', sigla: 'ES', flag: '🇪🇸', labelKey: 'language.es' },
];

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const active = getActiveLanguage();

  return (
    <View accessibilityRole="tablist" style={styles.row}>
      {OPTIONS.map((option, index) => {
        const selected = option.code === active;
        return (
          <View key={option.code} style={styles.item}>
            {index > 0 ? (
              <AppText variant="caption" style={styles.divider}>
                |
              </AppText>
            ) : null}
            <Pressable
              accessibilityLabel={t(option.labelKey)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              hitSlop={8}
              onPress={() => {
                void changeAppLanguage(option.code);
              }}
              style={styles.press}
            >
              <AppText variant="caption" style={[styles.sigla, selected ? styles.siglaOn : null]}>
                {option.flag} {option.sigla}
              </AppText>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  divider: {
    color: colors.mist,
    letterSpacing: 0,
    marginHorizontal: 4,
    opacity: 0.45,
  },
  press: {
    borderRadius: radii.pill,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  sigla: {
    color: colors.mist,
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  siglaOn: {
    color: colors.goldSoft,
  },
});
