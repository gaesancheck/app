import { useEffect, useState } from "react";
import type { ComponentRef, ReactNode, RefObject } from "react";
import { Animated, Modal, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";

type DropdownMenuProps = {
    anchorRef: RefObject<ComponentRef<typeof View> | null>;
    visible: boolean;
    progress: Animated.Value;
    width: number;
    gap: number;
    align: "center" | "right";
    onClose: () => void;
    children: ReactNode;
};

type AnchorLayout = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export default function DropdownMenu({
    anchorRef,
    visible,
    progress,
    width,
    gap,
    align,
    onClose,
    children,
}: DropdownMenuProps) {
    const [anchor, setAnchor] = useState<AnchorLayout | null>(null);
    const [isPresented, setIsPresented] = useState(false);
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();

    useEffect(() => {
        if (!visible) return;

        let cancelled = false;
        anchorRef.current?.measureInWindow((x, y, anchorWidth, height) => {
            if (!cancelled) {
                setAnchor({ "x": x, "y": y, "width": anchorWidth, "height": height });
            }
        });

        return () => {
            cancelled = true;
        };
    }, [anchorRef, visible, screenWidth, screenHeight]);

    useEffect(() => {
        if (!isPresented) return;

        const animation = Animated.timing(progress, {
            "toValue": visible ? 1 : 0,
            "duration": 180,
            "useNativeDriver": true,
        });

        animation.start(({ finished }) => {
            if (finished && !visible) {
                setAnchor(null);
                setIsPresented(false);
            }
        });

        return () => animation.stop();
    }, [visible, isPresented, progress]);

    if (!anchor) return null;

    const left = align === "right"
        ? anchor.x + anchor.width - width
        : anchor.x + (anchor.width - width) / 2;

    return <Modal
        transparent
        visible
        animationType="none"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        navigationBarTranslucent
        onShow={() => setIsPresented(true)}
        onRequestClose={onClose}
    >
        <View style={styles.container} pointerEvents="box-none">
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="드롭다운 닫기"
                style={StyleSheet.absoluteFill}
                onPress={onClose}
            />
            <View
                onAccessibilityEscape={onClose}
                style={[
                    styles.menu,
                    {
                        "top": anchor.y + anchor.height + gap,
                        "left": Math.max(0, Math.min(left, screenWidth - width)),
                        "width": width,
                    },
                ]}
            >
                {children}
            </View>
        </View>
    </Modal>;
}

const styles = StyleSheet.create({
    "container": {
        "flex": 1,
    },
    "menu": {
        "position": "absolute",
    },
});
