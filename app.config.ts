import { ExpoConfig } from '@expo/config';

export type Colors = typeof LightColors | typeof DarkColors;

export const LightColors = {
    /** #aabb8d */
    "green_light1": "#aabb8d",
    /** #688f6e */
    "green_light2": "#688f6e",
    /** #2f6439 */
    "green_dark1": "#2f6439",
    /** #2a5032 */
    "green_dark2": "#2a5032",
    /** #eaf0e6 */
    "white": "#eaf0e6",
    /** #faead7 */
    "white2": "#faead7",
    /** #edd693 */
    "yellow": "#edd693",
    /** #F7F7F2 */
    "background": "#F7F7F2",
};

export const DarkColors = {
    /** #aabb8d */
    "green_light1": "#aabb8d",
    /** #688f6e */
    "green_light2": "#688f6e",
    /** #2f6439 */
    "green_dark1": "#2f6439",
    /** #2a5032 */
    "green_dark2": "#2a5032",
    /** #eaf0e6 */
    "white": "#eaf0e6",
    /** #faead7 */
    "white2": "#faead7",
    /** #edd693 */
    "yellow": "#edd693",
    /** #F7F7F2 */
    "background": "#F7F7F2",
};

const config: ExpoConfig = {
    "name": "개산책",
    "slug": "pawstep",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/android-icon.png",
    "scheme": "pawstep",
    "extra": {
        "kakaoNativeAppKey": process.env.NATIVE_APP_KEY ?? process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY ?? ""
    },
    "userInterfaceStyle": "automatic",
    "ios": {
        "bundleIdentifier": "kr.pro203s.pawstep",
        "appleTeamId": "6N4XWB3QSL",
        "icon": "./assets/app.icon",
        "infoPlist": {
            "NSPhotoLibraryUsageDescription": "일기에 사진 첨부 등의 기능을 이용하려면 사진 접근 권한이 필요해요."
        }
    },
    "android": {
        "package": "kr.pro203s.pawstep",
        "icon": "./assets/images/android-icon.png",
        "adaptiveIcon": {
            "backgroundColor": "#E9F0E5",
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
        "./plugins/with-kakao-map",
        "./plugins/with-google-modular-headers",
        "./plugins/with-native-social-login",
        "expo-router",
        [
            "expo-splash-screen",
            {
                "backgroundColor": "#F7F7F2",
                "image": "./assets/images/icon.png",
                "imageWidth": 187
            }
        ],
        "expo-font",
        "expo-dev-client",
        "expo-secure-store",
        "expo-image",
        "expo-web-browser",
        [
            "expo-image-picker",
            {
                "photosPermission": "일기에 사진 첨부 등의 기능을 이용하려면 사진 접근 권한이 필요해요.",
                "colors": {
                    "cropToolbarColor": "#000000"
                },
                "dark": {
                    "colors": {
                        "cropToolbarColor": "#000000"
                    }
                }
            }
        ],
        [
            "expo-secure-store",
            {
                "configureAndroidBackup": false,
                "faceIDPermission": "민감한 데이터를 저장하기 위해 생체 데이터를 사용해요."
            }
        ]
    ],
    "experiments": {
        "typedRoutes": true,
        "reactCompiler": true
    }
};

export default config;
