import { useColorScheme } from "react-native";

export default function useChooseByScheme<L, D>(lightStyles: L, darkStyles: D) {
    const isDark = useColorScheme() === "dark";
    return isDark ? darkStyles : lightStyles;
}