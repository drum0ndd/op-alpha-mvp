import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '@op-alpha/design-tokens';
import { cardImages } from '../lib/images';

export function CardImage({ name, imageKey, imageUrl, width, height }: {
  name: string; imageKey?: string | null; imageUrl?: string | null; width: number; height: number;
}) {
  const source = imageKey ? cardImages[imageKey] : undefined;
  const safeUrl = imageUrl && /^https?:\/\//i.test(imageUrl) ? imageUrl : null;
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  if (source || (safeUrl && failedUrl !== safeUrl)) return <Image accessibilityLabel={name}
    source={source ?? { uri: safeUrl! }} resizeMode="contain" onError={() => setFailedUrl(safeUrl)} style={{ width, height, alignSelf: 'center' }}/>;
  return <View accessibilityLabel={`Imagem indisponível: ${name}`} style={[styles.empty, { width, height }]}>
    <Text style={styles.text}>Imagem indisponível</Text>
  </View>;
}
const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center', alignSelf: 'center', borderRadius: 10, backgroundColor: colors.panel2, padding: 8 },
  text: { color: colors.muted, textAlign: 'center', fontSize: 12 },
});
