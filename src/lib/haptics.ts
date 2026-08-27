import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

function canVibrate(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

function fire(task: () => Promise<void>): void {
  if (!canVibrate()) {
    return;
  }
  void task().catch(() => {
    // Web, emulators, and denied haptics fail silently.
  });
}

/** Light impact for ordinary taps and tab changes. */
export function hapticLight(): void {
  fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

/** Selection pulse for the language switcher and field focus. */
export function hapticSelection(): void {
  fire(() => Haptics.selectionAsync());
}

/** Subtle tick when a stroke crosses the 12° atelier guideline. */
export function hapticGuidelineHit(): void {
  fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft));
}

/** Celebration after the Forge ritual or a compiled AI grimoire. */
export function hapticSuccess(): void {
  fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

/** Warning impact when the user touches a locked Paywall gate. */
export function hapticWarning(): void {
  fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}
