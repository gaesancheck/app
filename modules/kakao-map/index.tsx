import { requireNativeView } from 'expo';
import type { NativeSyntheticEvent, ViewProps } from 'react-native';

export type MapCoordinate = { latitude: number; longitude: number };

export type KakaoMapViewProps = ViewProps & {
    /** iOS: ordered route points; automatically marks the first/last as 출발/도착. */
    routeCoordinates?: MapCoordinate[];
    appKey: string;
    active?: boolean;
    onMapReady?: () => void;
    onMapError?: (event: NativeSyntheticEvent<{ message: string }>) => void;
};

export default requireNativeView<KakaoMapViewProps>('PawStepKakaoMap');
