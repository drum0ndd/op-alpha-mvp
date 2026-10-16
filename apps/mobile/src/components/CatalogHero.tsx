import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { colors } from '@op-alpha/design-tokens';
import { CardImage } from './CardImage';
import { ui } from './ScreenFrame';

export function CatalogHero() {
  const compact = useWindowDimensions().width < 600;
  return <LinearGradient colors={['#29220E', '#14191D', '#101118']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
    style={{ borderRadius: 32, padding: compact ? 24 : 40, minHeight: 300, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: 20 }}>
    <View style={{ flex: 1, gap: 20, zIndex: 1 }}>
      <Text style={ui.eyebrow}>SUA JORNADA · ONE PIECE TCG</Text>
      <Text style={[ui.title, { fontSize: compact ? 28 : 40, maxWidth: 440 }]}>Cada carta tem{ '\n' }uma história.</Text>
      <Text style={[ui.text, { maxWidth: 320 }]}>Organize sua coleção, uma impressão de cada vez.</Text>
      <Link href="/scan" asChild><Pressable accessibilityRole="link" style={StyleSheet.flatten([ui.button, { alignSelf: 'flex-start' }])}><Text style={ui.buttonText}>＋ Cadastrar carta</Text></Pressable></Link>
    </View>
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none"
      style={compact ? { position: 'absolute', width: 310, height: 270, right: -95, bottom: -30, opacity: 0.12 } : { width: 310, height: 270 }}>
      <View style={{ position: 'absolute', left: 15, top: 20, transform: [{ rotate: '-12deg' }] }}><CardImage name="Ilustração de carta" imageKey="uta-eb03-061-aa" width={155} height={217}/></View>
      <View style={{ position: 'absolute', right: 5, top: 0, transform: [{ rotate: '9deg' }] }}><CardImage name="Ilustração de carta" imageKey="trafalgar-law-p-088-re" width={175} height={245}/></View>
      {!compact && <Text style={{ color: colors.muted, position: 'absolute', bottom: 0, right: 0, fontSize: 10 }}>Artes ilustrativas</Text>}
    </View>
  </LinearGradient>;
}
