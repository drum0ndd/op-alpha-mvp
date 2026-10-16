import { colors, radius, spacing } from '@op-alpha/design-tokens';
import type { HomeResponse } from '@op-alpha/contracts';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { decimal } from '../lib/format';
type Index=HomeResponse['marketIndices'][number];
export function MarketIndexCard({ item }: { item: Index }) {
  const up=(item.variationPct ?? 0)>=0; const max=Math.max(...item.points); const min=Math.min(...item.points);
  const points=item.points.map((p,i)=>`${i*(100/(item.points.length-1))},${28-((p-min)/(max-min||1))*24}`).join(' ');
  return <View style={styles.card}><Text style={styles.label}>{item.label}</Text><Text style={styles.value}>{decimal.format(item.value)}</Text><Text style={[styles.delta,{color:item.variationPct === null ? colors.muted : up?colors.green:colors.red}]}>{item.variationPct === null ? 'Sem variação disponível' : `${up?'+':''}${decimal.format(item.variationPct)}% ${up?'↗':'↘'}`}</Text><Svg width="100%" height={32} viewBox="0 0 100 30"><Polyline points={points} fill="none" stroke={up?colors.green:colors.red} strokeWidth="2" /></Svg></View>;
}
const styles=StyleSheet.create({card:{flexGrow:1,flexBasis:'45%',minWidth:120,minHeight:118,backgroundColor:colors.panel2,borderColor:colors.line,borderWidth:1,borderRadius:radius.md,padding:spacing.md},label:{color:'#D6DDE1',fontSize:11},value:{color:colors.text,fontSize:22,fontWeight:'900',marginTop:8},delta:{fontWeight:'700',marginTop:2}});
