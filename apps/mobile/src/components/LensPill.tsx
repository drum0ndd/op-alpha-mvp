import { colors, radius } from '@op-alpha/design-tokens';
import type { UILens as Lens } from '../providers/LensProvider';
import { Pressable, StyleSheet, Text, View } from 'react-native';
const labels: Record<Lens,string>={COLLECTOR:'Colecionador',INVESTOR:'Investidor',PLAYER:'Player'};
export function LensPill({ active, onChange }:{active:Lens;onChange:(lens:Lens)=>void}){
 return <View style={styles.wrap}>{(Object.keys(labels) as Lens[]).map(l=><Pressable accessibilityRole="button" accessibilityState={{selected:active===l}} key={l} onPress={()=>onChange(l)} style={[styles.pill,active===l&&styles.active]}><Text style={[styles.text,active===l&&styles.activeText]}>{labels[l]}</Text></Pressable>)}</View>;
}
const styles=StyleSheet.create({wrap:{flexWrap:'wrap',flexDirection:'row',gap:6,marginBottom:12},pill:{minHeight:44,justifyContent:'center',paddingHorizontal:11,paddingVertical:8,borderRadius:radius.pill,borderWidth:1,borderColor:colors.line,backgroundColor:colors.panel},active:{borderColor:colors.gold,backgroundColor:'rgba(243,192,58,.12)'},text:{color:colors.muted,fontSize:11,fontWeight:'700'},activeText:{color:colors.gold}});
