import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native"
import { useState } from "react";
import { Colors, DarkColors, LightColors } from "../../app.config";
import useChooseByScheme from "@/modules/useChooseByScheme";
import dayjs from "dayjs";
import 'dayjs/locale/ko';
import Svg, { Line, SvgProps } from "react-native-svg";

import SvgCamera from '@/assets/svg/camera.svg';
import SvgMinus from '@/assets/svg/minus.svg';
import SvgClear from '@/assets/svg/weather/clear.svg';
import SvgCloudy from '@/assets/svg/weather/cloudy.svg';
import SvgMostlyCloudy from '@/assets/svg/weather/mostly_cloudy.svg';
import SvgPartlyCloudy from '@/assets/svg/weather/partly_cloudy.svg';
import SvgRainy from '@/assets/svg/weather/rainy.svg';
import SvgSnowy from '@/assets/svg/weather/snowy.svg';
import SvgThunder from '@/assets/svg/weather/thunder.svg';
import SvgPlus from '@/assets/svg/plus.svg';

type Props = {
    data: WalkRecord,
    styles?: ViewStyle,
    showDeleteButton?: boolean,
    onPressPicture?: () => void,
    onPressWeather?: () => void,
    onPressContent?: () => void,
    onPressDelete?: () => void
}

export const WEATHER: Record<string, React.FC<SvgProps>> = {
    "clear": SvgClear,
    "cloudy": SvgCloudy,
    "mostly_cloudy": SvgMostlyCloudy,
    "partly_cloudy": SvgPartlyCloudy,
    "rainy": SvgRainy,
    "snowy": SvgSnowy,
    "thunder": SvgThunder
};

export default function SmallDiary(props: Props) {
    const { data, showDeleteButton, onPressContent, onPressPicture, onPressWeather, onPressDelete } = props;
    const customStyles = props.styles;
    const colors = useChooseByScheme(LightColors, DarkColors);
    const styles = getStyles(colors);
    const [contentLines, setContentLines] = useState<{ x: number; y: number; width: number; height: number }[]>([]);

    const WeatherIcon: React.FC<SvgProps> | undefined = WEATHER[data.weather as string];

    return <View style={[styles.container, customStyles]}>
        <View style={styles.diaryInfo}>
            <Pressable onPress={onPressPicture}>
                {data.picture ? <Image
                    source={{ "uri": data.picture }}
                    style={styles.picture}
                /> : <View style={styles.noPicture}>
                    <SvgCamera width={20} height={17} />
                    <Text style={styles.noPictureText}>사진을 첨부해주세요</Text>
                </View>}
            </Pressable>
            <View style={styles.diaryExtras}>
                <Text style={styles.infoText}>{dayjs(data.date, "YYYYMMDD").locale("ko").format("YY년 MM월 DD일 dddd")}</Text>
                {WeatherIcon ?
                    <Pressable onPress={onPressWeather} style={styles.weatherIcon}>
                        <WeatherIcon />
                    </Pressable> :
                    <Pressable onPress={onPressWeather} style={styles.noWeather}>
                        <SvgPlus width={11} height={11} color="#474747" />
                    </Pressable>
                }
            </View>
            {showDeleteButton && <TouchableOpacity style={styles.delete} onPress={onPressDelete}>
                <SvgMinus width={10} height={2} stroke="#6e6e6e" />
            </TouchableOpacity>}
        </View>
        <Pressable style={styles.diaryContent} onPress={onPressContent}>
            <Text style={styles.diaryContentText} onTextLayout={event => setContentLines(event.nativeEvent.lines)}>
                {data.content || "오늘의 산책을 기록해주세요"}
            </Text>
            <Svg pointerEvents="none" accessible={false} width="100%" height="100%" style={StyleSheet.absoluteFill}>
                {contentLines.map((line, index) => line.width > 0 && <Line
                    key={index}
                    x1={line.x}
                    x2={line.x + line.width}
                    y1={line.y + line.height + 2}
                    y2={line.y + line.height + 2}
                    stroke="#474747"
                    strokeWidth={0.7}
                    strokeDasharray="1 3"
                    strokeLinecap="round"
                />)}
            </Svg>
        </Pressable>
    </View>;
}

const getStyles = (colors: Colors) => StyleSheet.create({
    "container": {
        "borderColor": "#9A9A9A",
        "borderStyle": "solid",
        "borderWidth": 0.7,
        "marginHorizontal": 19,
        "paddingHorizontal": 15,
        "paddingVertical": 14,
        "backgroundColor": "#FAFBF7",
        "minHeight": 197,
        "borderRadius": 12
    },
    "noPicture": {
        "borderRadius": 10,
        "borderWidth": 2,
        "borderStyle": "dashed",
        "borderColor": "#9CA3AF",
        "width": 85,
        "height": 85,
        "justifyContent": "center",
        "alignItems": "center",
        "flexDirection": "column",
        "gap": 8,
        "backgroundColor": "#eceee6"
    },
    "noPictureText": {
        "fontFamily": "Ownglyph PDH",
        "fontSize": 7,
        "color": "#9f9f9f"
    },
    "picture": {
        "borderRadius": 10,
        "width": 85,
        "height": 85
    },
    "diaryInfo": {
        "gap": 10,
        "flexDirection": "row"
    },
    "delete": {
        "backgroundColor": "#E36163",
        "width": 20,
        "height": 20,
        "borderRadius": 10,
        "justifyContent": "center",
        "alignItems": "center",
        "marginLeft": "auto"
    },
    "weatherIcon": {
        "width": 30,
        "height": 30,
        "paddingHorizontal": 5,
        "paddingVertical": 9,
        "borderStyle": "solid",
        "borderWidth": 1.3,
        "borderColor": "rgba(231, 233, 224, 0.7)",
        "borderRadius": 15,
        "backgroundColor": colors.green_light2,
        "justifyContent": "center",
        "alignItems": "center"
    },
    "diaryExtras": {
        "flexDirection": "column",
        "gap": 16
    },
    "infoText": {
        "color": "#000",
        "fontFamily": "Ownglyph PDH",
        "fontSize": 14,
        "fontStyle": "normal",
        "fontWeight": 400
    },
    "diaryContent": {
        "marginTop": 10
    },
    "diaryContentText": {
        "fontSize": 16,
        "fontFamily": "Ownglyph PDH",
        "color": "#474747",
        "lineHeight": 25,
        "paddingBottom": 4,
        "textAlignVertical": "top"
    },
    "noWeather": {
        "width": 30,
        "height": 30,
        "paddingHorizontal": 7,
        "paddingVertical": 7,
        "borderStyle": "dashed",
        "borderWidth": 1.3,
        "borderColor": "#9a9a9a",
        "backgroundColor": "rgba(231, 233, 224, 0.7)",
        "borderRadius": 15,
        "justifyContent": "center",
        "alignItems": "center"
    }
});
