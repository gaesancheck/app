import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

export type DropdownOption = {
    label: string;
    onPress?: () => void;
};

type DropdownProps = {
    children: ReactNode;
    options: DropdownOption[];
    containerStyle?: StyleProp<ViewStyle>;
    disabled?: boolean
};

export default function Dropdown({
    children,
    options,
    containerStyle,
    disabled
}: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const progress = useRef(new Animated.Value(0)).current;
    const opacity = progress;
    const scale = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.94, 1],
    });
    const translateY = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [-4, 0],
    });

    useEffect(() => {
        Animated.timing(progress, {
            toValue: isOpen ? 1 : 0,
            duration: 180,
            useNativeDriver: true,
        }).start();
    }, [isOpen, progress]);

    const selectOption = (option: DropdownOption) => {
        option.onPress?.();
        setIsOpen(false);
    };

    return <View style={[styles.container, containerStyle]}>
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ "expanded": isOpen }}
            onPress={() => setIsOpen((open) => !open)}
            style={styles.trigger}
            disabled={disabled}
        >
            {children}
        </Pressable>
        <Animated.View
            accessibilityElementsHidden={!isOpen}
            importantForAccessibility={isOpen ? "auto" : "no-hide-descendants"}
            pointerEvents={isOpen ? "auto" : "none"}
            style={[
                styles.menu,
                {
                    "opacity": opacity,
                    "transform": [{ "translateY": translateY }, { "scaleY": scale }],
                },
            ]}
        >
            <View style={styles.menuContent}>
                {options.map((option, index) => <Pressable
                    key={`${option.label}-${index}`}
                    accessibilityRole="button"
                    onPress={() => selectOption(option)}
                    style={[styles.option, index > 0 && styles.optionDivider]}
                >
                    <Text style={styles.optionLabel}>{option.label}</Text>
                </Pressable>)}
            </View>
        </Animated.View>
    </View>;
}

const styles = StyleSheet.create({
    "container": {
        "position": "relative",
        "zIndex": 10,
    },
    "trigger": {
        "flexDirection": "row",
        "alignItems": "center",
        "justifyContent": "center",
        "gap": 9,
    },
    "menu": {
        "position": "absolute",
        "top": 30,
        "right": 0,
        "width": 106.5,
        "borderRadius": 15,
        "borderWidth": 0.75,
        "borderColor": "#474747",
        "backgroundColor": "#FEFEFE",
        "zIndex": 20,
        "elevation": 4,
        "shadowColor": "#000000",
        "shadowOffset": { "width": 0, "height": 1 },
        "shadowOpacity": 0.25,
        "shadowRadius": 2,
    },
    "menuContent": {
        "borderRadius": 15,
        "overflow": "hidden",
    },
    "option": {
        "minHeight": 31.5,
        "alignItems": "center",
        "justifyContent": "center",
    },
    "optionDivider": {
        "borderTopWidth": 0.75,
        "borderTopColor": "#474747",
    },
    "optionLabel": {
        "fontFamily": "Ownglyph PDH",
        "fontSize": 16.5,
        "color": "#474747",
    },
});
