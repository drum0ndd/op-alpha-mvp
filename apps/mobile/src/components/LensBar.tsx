import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '@op-alpha/design-tokens';
import { lensOptions, useLens, type UILens } from '../providers/LensProvider';

function LensIcon({ lens, color }: { lens: UILens; color: string }) {
  return <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7}>
    {lens === 'COLLECTOR' ? <><Rect x={7} y={3} width={12} height={17} rx={2}/><Path d="M5 6H4a1 1 0 0 0-1 1v13a2 2 0 0 0 2 2h10"/><Path d="M10 8h6M10 12h6"/></>
      : lens === 'INVESTOR' ? <><Path d="M4 20V4M4 20h16M7 15l4-5 4 2 5-7M16 5h4v4"/></>
      : <><Circle cx={12} cy={8} r={4}/><Path d="m9 12-2 7h10l-2-7M6 22h12"/></>}
  </Svg>;
}

export function LensBar() {
  const { lens, setLens } = useLens();
  return <View accessibilityRole="tablist" style={styles.row}>{lensOptions.map(option => {
    const selected = lens === option.value;
    const color = selected ? option.color : colors.muted;
    return <Pressable key={option.value} accessibilityRole="tab" accessibilityState={{ selected }} aria-selected={selected}
      onPress={() => setLens(option.value)} style={[styles.option, selected && { backgroundColor: colors.panel2 }]}>
      <LensIcon lens={option.value} color={color}/><Text style={[styles.label, { color }]}>{option.label}</Text>
    </Pressable>;
  })}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4, padding: 6, borderRadius: 999, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, maxWidth: 600, width: '100%', alignSelf: 'center' },
  option: { flex: 1, minHeight: 56, paddingVertical: 8, paddingHorizontal: 4, gap: 5, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  label: { fontSize: 12, fontWeight: '700' },
});
