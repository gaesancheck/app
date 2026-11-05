import * as Haptics from "expo-haptics";

export const haptics = {
    "light": () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    "midium": () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    "rigid": () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid),
    "soft": () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft),
    "heavy": () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
};
