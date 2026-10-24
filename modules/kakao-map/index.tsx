import { requireNativeView } from 'expo';
import type { NativeSyntheticEvent, ViewProps } from 'react-native';

export type KakaoMapViewProps = ViewProps & {
    appKey: string;
    active?: boolean;
    onMapReady?: () => void;
    onMapError?: (event: NativeSyntheticEvent<{ message: string }>) => void;
};

export default requireNativeView<KakaoMapViewProps>('PawStepKakaoMap');
