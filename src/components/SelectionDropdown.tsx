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

const DESIGN_SCALE = 1.5;

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
    const [triggerHeight, setTriggerHeight] = useState(0);
    const [optionTextWidth, setOptionTextWidth] = useState(0);
    const progress = useRef(new Animated.Value(0)).current;
    const menuWidth = Math.max(
        optionTextWidth + 28 * DESIGN_SCALE,
        82 * DESIGN_SCALE,
    );
    const opacity = progress;
    const scale = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.94, 1],
    });
    const translateY = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [-4 * DESIGN_SCALE, 0],
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
            onLayout={(event) => setTriggerHeight(event.nativeEvent.layout.height)}
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
                    "top": triggerHeight + 3,
                    "width": menuWidth,
                    "opacity": opacity,
                    "transform": [{ "translateY": translateY }, { "scaleY": scale }],
                },
            ]}
        >
            <ScrollView
                contentContainerStyle={styles.options}
                showsVerticalScrollIndicator={false}
            >
                {options.map((option) => <Pressable
                    key={String(option.value)}
                    accessibilityRole="button"
                    accessibilityState={{ "selected": option.value === value }}
                    onPress={() => selectOption(option)}
                    style={styles.option}
                >
                    <Text
                        numberOfLines={1}
                        style={[
                            option.value === value ? styles.optionLabelSelected : styles.optionLabel,
                            option.value === value && optionTextWidth > 0
                                ? { "width": optionTextWidth }
                                : undefined,
                        ]}
                    >
                        {option.label}
                    </Text>
                </Pressable>)}
            </ScrollView>
        </Animated.View>
        <View style={styles.measurement} pointerEvents="none" accessibilityElementsHidden>
            {options.map((option) => <Text
                key={`measure-${String(option.value)}`}
                numberOfLines={1}
                onLayout={(event) => {
                    const width = event.nativeEvent.layout.width;
                    setOptionTextWidth((currentWidth) => Math.max(currentWidth, width));
                }}
                style={styles.optionLabelSelected}
            >
                {option.label}
            </Text>)}
        </View>
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
        "alignSelf": "center",
        "flexDirection": "column",
        "justifyContent": "center",
        "maxHeight": 86 * DESIGN_SCALE,
        "borderRadius": 10 * DESIGN_SCALE,
        "borderWidth": 0.5 * DESIGN_SCALE,
        "borderColor": "#474747",
        "backgroundColor": "#FEFEFE",
        "paddingHorizontal": 14 * DESIGN_SCALE,
        "paddingVertical": 5 * DESIGN_SCALE,
        "zIndex": 20,
        "elevation": 4 * DESIGN_SCALE,
        "shadowColor": "#000000",
        "shadowOffset": { "width": 0, "height": DESIGN_SCALE },
        "shadowOpacity": 0.25,
        "shadowRadius": 2 * DESIGN_SCALE,
    },
    "options": {
        "gap": 7 * DESIGN_SCALE,
    },
    "option": {
        "alignItems": "center",
        "justifyContent": "center",
    },
    "optionLabel": {
        "fontFamily": "Ownglyph PDH",
        "fontSize": 11 * DESIGN_SCALE,
        "letterSpacing": 0.33 * DESIGN_SCALE,
        "color": "#9B9B9B",
    },
    "optionLabelSelected": {
        "fontFamily": "Ownglyph PDH",
        "fontSize": 13 * DESIGN_SCALE,
        "letterSpacing": 0.39 * DESIGN_SCALE,
        "color": "#474747",
    },
    "measurement": {
        "position": "absolute",
        "top": -1000,
        "left": -1000,
        "width": 1000,
        "opacity": 0,
        "alignItems": "flex-start",
    },
});
