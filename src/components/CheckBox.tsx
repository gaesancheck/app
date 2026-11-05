import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native";
import useChooseByScheme from "@/modules/useChooseByScheme";
import { Colors, DarkColors, LightColors } from "@/../app.config";

import SvgCheck from "@/assets/svg/check.svg";

type Props = {
    "style"?: any;
    "disabledStyle"?: any;
    "value": boolean;
    "onValueChange"?: (value: boolean) => any;
    "checkedBackgroundColor"?: string;
    "checkIconColor"?: string;
    "disabled"?: boolean;
    "touchFeedbackOpacity"?: number;
};

export default function CheckBox(props: Props) {
    const {
        style,
        disabledStyle,
        value,
        onValueChange,
        checkedBackgroundColor,
        checkIconColor,
        disabled,
        touchFeedbackOpacity,
    } = props;
    const colors = useChooseByScheme(LightColors, DarkColors);
    const styles = getStyles(colors);
    const isDarkMode = useColorScheme() === "dark";

    return (
        <TouchableOpacity
            activeOpacity={touchFeedbackOpacity}
            style={{
                ...styles.container,
                ...(value
                    ? {
                          "justifyContent": "center",
                          "backgroundColor": checkedBackgroundColor ?? (isDarkMode ? "#fff" : "#000"),
                      }
                    : {}),
                ...style,
                ...(disabled ? disabledStyle : {}),
            }}
            onPress={() => onValueChange?.(!value)}
        >
            {value && (
                <SvgCheck
                    color={checkIconColor ?? (isDarkMode ? "#000" : "#fff")}
                    width={value ? 9.52 : 0}
                    height={value ? 9.52 : 0}
                    style={styles.icon}
                />
            )}
        </TouchableOpacity>
    );
}

const getStyles = (colors: Colors) =>
    StyleSheet.create({
        "container": {
            "width": 24,
            "height": 24,
            "borderStyle": "solid",
            "borderWidth": 1.5,
            "borderRadius": 5,
        },
        "icon": {
            "margin": "auto",
        },
    });
