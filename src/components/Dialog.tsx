import type { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";

export type DialogButton = {
    "label": string;
    "onPress": () => void;
    "variant"?: "filled" | "outline";
    "disabled"?: boolean;
    "style"?: StyleProp<ViewStyle>;
    "textStyle"?: StyleProp<TextStyle>;
};

type DialogProps = {
    "visible": boolean;
    "onClose": () => void;
    "children": ReactNode;
    "buttons"?: DialogButton[];
    "dismissOnBackdropPress"?: boolean;
    "containerStyle"?: StyleProp<ViewStyle>;
    "contentStyle"?: StyleProp<ViewStyle>;
};

export default function Dialog({
    visible,
    onClose,
    children,
    buttons = [],
    dismissOnBackdropPress = true,
    containerStyle,
    contentStyle,
}: DialogProps) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable
                    accessible={false}
                    importantForAccessibility="no"
                    style={styles.backdrop}
                    onPress={dismissOnBackdropPress ? onClose : undefined}
                />
                <View
                    accessibilityViewIsModal
                    onAccessibilityEscape={onClose}
                    style={[styles.container, containerStyle]}
                >
                    <View style={[styles.content, contentStyle]}>
                        {typeof children === "string" || typeof children === "number" ? (
                            <Text style={styles.message}>{children}</Text>
                        ) : (
                            children
                        )}
                    </View>
                    {buttons.length > 0 && (
                        <View style={styles.buttons}>
                            {buttons.map((button, index) => {
                                const outlined = button.variant === "outline";

                                return (
                                    <Pressable
                                        key={`${button.label}-${index}`}
                                        accessibilityRole="button"
                                        accessibilityState={{ "disabled": Boolean(button.disabled) }}
                                        disabled={button.disabled}
                                        onPress={button.onPress}
                                        style={({ pressed }) => [
                                            styles.button,
                                            outlined ? styles.outlineButton : styles.filledButton,
                                            (pressed || button.disabled) && styles.dimmedButton,
                                            button.style,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.buttonText,
                                                outlined ? styles.outlineButtonText : styles.filledButtonText,
                                                button.textStyle,
                                            ]}
                                        >
                                            {button.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    "overlay": {
        "flex": 1,
        "alignItems": "center",
        "justifyContent": "center",
        "padding": 20,
    },
    "backdrop": {
        ...StyleSheet.absoluteFill,
        "backgroundColor": "rgba(0, 0, 0, 0.25)",
    },
    "container": {
        "width": 302,
        "maxWidth": "100%",
        "minHeight": 126,
        "paddingHorizontal": 30,
        "paddingVertical": 30,
        "borderRadius": 12,
        "borderWidth": 2,
        "borderColor": "#9A9A9A",
        "backgroundColor": "#FAFBF7",
    },
    "content": {
        "alignItems": "center",
        "justifyContent": "center",
    },
    "message": {
        "fontFamily": "Ownglyph PDH",
        "fontSize": 14,
        "color": "#000000",
        "textAlign": "center",
    },
    "buttons": {
        "flexDirection": "row",
        "flexWrap": "wrap",
        "alignItems": "center",
        "justifyContent": "center",
        "gap": 10,
        "marginTop": 22,
    },
    "button": {
        "width": 100,
        "maxWidth": "100%",
        "minHeight": 26,
        "paddingHorizontal": 10,
        "paddingVertical": 2,
        "borderRadius": 13,
        "borderWidth": 1,
        "borderColor": "#688F6E",
        "alignItems": "center",
        "justifyContent": "center",
    },
    "filledButton": {
        "backgroundColor": "#688F6E",
    },
    "outlineButton": {
        "backgroundColor": "#FFFFFF",
    },
    "dimmedButton": {
        "opacity": 0.5,
    },
    "buttonText": {
        "fontFamily": "Ownglyph PDH",
        "fontSize": 14,
        "textAlign": "center",
    },
    "filledButtonText": {
        "color": "#FFFFFF",
    },
    "outlineButtonText": {
        "color": "#688F6E",
    },
});
