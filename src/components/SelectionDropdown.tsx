import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
    Animated,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

export type SelectionDropdownOption = {
    label: string;
    value: string | number;
};

type SelectionDropdownProps = {
    children: ReactNode;
    value?: string | number;
    options: SelectionDropdownOption[];
    onChange?: (value: string | number) => void;
    containerStyle?: StyleProp<ViewStyle>;
    disabled?: boolean
};

export default function SelectionDropdown({
    children,
    value,
    options,
    onChange,
    containerStyle,
    disabled
}: SelectionDropdownProps) {
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

    const selectOption = (option: SelectionDropdownOption) => {
        onChange?.(option.value);
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
            <ScrollView showsVerticalScrollIndicator={false}>
                {options.map((option) => <Pressable
                    key={String(option.value)}
                    accessibilityRole="button"
                    accessibilityState={{ "selected": option.value === value }}
                    onPress={() => selectOption(option)}
                    style={styles.option}
                >
                    <Text style={option.value === value ? styles.optionLabelSelected : styles.optionLabel }>{option.label}</Text>
                </Pressable>)}
            </ScrollView>
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
        "alignSelf": "center",
        "width": 123,
        "maxHeight": 129,
        "borderRadius": 15,
        "borderWidth": 0.75,
        "borderColor": "#474747",
        "backgroundColor": "#FEFEFE",
        "paddingVertical": 6,
        "zIndex": 20,
        "elevation": 4,
        "shadowColor": "#000000",
        "shadowOffset": { "width": 0, "height": 1 },
        "shadowOpacity": 0.25,
        "shadowRadius": 2,
    },
    "option": {
        "height": 22.5,
        "alignItems": "center",
        "justifyContent": "center",
    },
    "optionLabel": {
        "fontFamily": "Ownglyph PDH",
        "fontSize": 16.5,
        "color": "#9B9B9B",
    },
    "optionLabelSelected": {
        "fontFamily": "Ownglyph PDH",
        "fontSize": 22.5,
        "color": "#474747",
    },
});
