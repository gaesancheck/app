import { ExpoConfig } from '@expo/config';

const config: ExpoConfig = {
    "name": "개산책",
    "slug": "dogwalk",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/android-icon.png",
    "scheme": "dogwalk",
    "userInterfaceStyle": "automatic",
    "ios": {
        "bundleIdentifier": "com.pro203s.dogwalk",
        "icon": "./assets/app.icon"
    },
    "android": {
        "package": "com.pro203s.dogwalk",
        "icon": "./assets/images/android-icon.png",
        "adaptiveIcon": {
            "backgroundColor": "#FFFFFF",
            "foregroundImage": "./assets/images/android-icon-foreground.png",
            "backgroundImage": "./assets/images/android-icon-background.png",
            "monochromeImage": "./assets/images/android-icon-monochrome.png"
        },
        "predictiveBackGestureEnabled": false
    },
    "platforms": [
        "android",
        "ios"
    ],
    "plugins": [
        "expo-router",
        [
            "expo-splash-screen",
            {
                "backgroundColor": "#208AEF",
                "image": "./assets/images/android-icon-foreground.png",
                "imageWidth": 76,
                "android": {
                    "backgroundColor": "#FFFFFF",
                    "image": "./assets/images/android-icon-foreground.png",
                    "imageWidth": 200
                }
            }
        ],
        "expo-font",
        "expo-dev-client",
        "expo-secure-store"
    ],
    "experiments": {
        "typedRoutes": true,
        "reactCompiler": true
    }
};

export default config;
