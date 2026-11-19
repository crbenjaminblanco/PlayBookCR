import { Image, Platform, View, type ImageSourcePropType, type ImageStyle } from 'react-native';

type Props = {
  source: ImageSourcePropType;
  height: number;
};

export function Plate({ source, height }: Props) {
  const contrast = Platform.OS === 'web' ? ({ filter: 'grayscale(1) contrast(1.45) brightness(1.05)' } as ImageStyle) : null;
  return (
    <View style={{ height, overflow: 'hidden', backgroundColor: '#000' }}>
      <Image
        source={source}
        resizeMode="cover"
        style={[{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right center' } as ImageStyle, contrast]}
      />
    </View>
  );
}
