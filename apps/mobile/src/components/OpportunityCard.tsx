import { colors, radius, spacing } from '@op-alpha/design-tokens';
import type { HomeResponse } from '@op-alpha/contracts';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { useState } from 'react';
import { money } from '../lib/profile';
import { CardImage } from './CardImage';
const modalStyles = StyleSheet.create({
 overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,.8)', padding: 16 },
 dialog: { width: '100%', maxWidth: 640, maxHeight: '90%', borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, borderRadius: 16 },
});
type Item=HomeResponse['opportunities'][number];
const label={BUY:'COMPRAR',BUY_BELOW:'COMPRAR ABAIXO',HOLD:'MANTER',SELL:'VENDER',AVOID:'EVITAR',SPECULATIVE:'ESPECULATIVO'} as const;
export function OpportunityCard({ item }: { item: Item }) {
 const { width } = useWindowDimensions();
 const [showAnalysis, setShowAnalysis] = useState(false);
 const price = (amount: number | null, currency: string | null) => amount !== null && currency ? money(amount, currency) : 'Indisponível';
 return <><View style={[styles.card,{width:Math.min(318,width-60)}]}>
  <CardImage name={item.name} imageKey={item.imageKey} imageUrl={item.imageUrl} width={Math.min(280,width-84)} height={230}/>
  <View style={styles.body}><Text style={styles.name}>{item.name}</Text><Text style={styles.meta}>{item.cardCode} • {item.variant}</Text>
   <View style={styles.score}><Text style={styles.scoreNumber}>{item.alphaScore}</Text><Text style={styles.scoreLabel}>ALPHA
SCORE</Text></View>
   {item.expired && <Text style={[styles.rationale, { color: colors.red }]}>Recomendação vencida</Text>}
   <View style={styles.row}><View><Text style={styles.hint}>Preço atual</Text><Text style={styles.price}>{price(item.currentPrice, item.currency)}</Text></View><View><Text style={styles.hint}>Preço de referência</Text><Text style={styles.fair}>{price(item.fairPrice, item.fairCurrency)}</Text></View></View>
   <Text style={styles.margin}>Margem {item.marginPct === null ? 'indisponível' : `${item.marginPct}%`}</Text><Text style={styles.rationale}>{item.rationale}</Text>
   <View style={styles.factors}><Text style={styles.factor}>Liquidez
<Text style={styles.factorValue}>{item.liquidity}</Text></Text><Text style={styles.factor}>Oferta
<Text style={styles.factorValue}>{item.supply ?? 'Indisponível'}</Text></Text><Text style={styles.factor}>Tendência
<Text style={styles.factorValue}>{item.trend}</Text></Text></View>
   <Pressable accessibilityRole="button" accessibilityLabel={`Ver recomendação para ${item.name}`} onPress={() => setShowAnalysis(true)} style={styles.reco}><Text style={styles.recoText}>{label[item.recommendation]}</Text></Pressable>
   <Pressable accessibilityRole="button" onPress={() => setShowAnalysis(true)} style={styles.analysis}><Text style={styles.analysisText}>VER ANÁLISE</Text></Pressable>
  </View>
 </View><Modal visible={showAnalysis} transparent animationType="fade" onRequestClose={() => setShowAnalysis(false)}>
  <View style={modalStyles.overlay}><View accessibilityViewIsModal style={modalStyles.dialog}><ScrollView contentContainerStyle={{ gap: 14, padding: 20 }}>
   <Pressable accessibilityRole="button" onPress={() => setShowAnalysis(false)} style={{ minHeight: 48, alignSelf: 'flex-start', justifyContent: 'center' }}><Text style={styles.fair}>← Fechar análise</Text></Pressable>
   <Text accessibilityRole="header" style={styles.name}>{item.name} · {item.cardCode}</Text>
   <Text style={styles.rationale}>{item.variant} · Alpha Score {item.alphaScore}</Text>
   <Text style={styles.recoText}>{label[item.recommendation]}{item.expired ? ' · VENCIDA' : ''}</Text>
   <Text style={styles.rationale}>{item.rationale}</Text>
   <Text style={styles.fair}>Preço atual: {price(item.currentPrice, item.currency)}</Text>
   <Text style={styles.rationale}>Observação: {item.priceObservedAt ? new Date(item.priceObservedAt).toLocaleString('pt-BR') : 'Indisponível'} · Condição: {item.currentCondition ?? 'Indisponível'} · Tipo: {item.currentPriceKind ?? 'Indisponível'}</Text>
   <Text style={styles.fair}>Referência: {price(item.fairPrice, item.fairCurrency)}</Text>
   <Text style={styles.rationale}>Margem {item.marginPct === null ? 'indisponível: a referência ainda não informa condição e tipo de preço comparáveis.' : `${item.marginPct}%`}</Text>
   <Text style={styles.rationale}>Validade: {item.validUntil ? new Date(item.validUntil).toLocaleString('pt-BR') : 'Não informada'}</Text>
   <Link href={{ pathname: '/cards/[id]', params: { id: item.cardId } }} asChild><Pressable accessibilityRole="link" onPress={() => setShowAnalysis(false)} style={styles.analysis}><Text style={styles.analysisText}>VER CARTA NO CATÁLOGO</Text></Pressable></Link>
  </ScrollView></View></View>
 </Modal></>;
}
const styles=StyleSheet.create({card:{width:318,marginRight:10,borderWidth:1,borderColor:'#213039',borderRadius:radius.lg,overflow:'hidden',backgroundColor:'#070A0C'},image:{width:'85%',aspectRatio:270/378,alignSelf:'center',marginTop:10,backgroundColor:'#F5F5F5',borderRadius:radius.md},body:{padding:spacing.md},name:{color:colors.text,fontSize:20,fontWeight:'900'},meta:{color:colors.muted,fontSize:12,marginTop:2},score:{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:8,borderWidth:1,borderColor:'#168C31',backgroundColor:'rgba(10,80,25,.18)',borderRadius:8,paddingHorizontal:10,paddingVertical:8,marginTop:10},scoreNumber:{color:colors.green,fontSize:28,fontWeight:'900'},scoreLabel:{color:colors.green,fontSize:9,fontWeight:'900'},row:{flexWrap:'wrap',gap:8,flexDirection:'row',justifyContent:'space-between',marginTop:12},hint:{color:colors.muted,fontSize:11},price:{color:colors.green,fontWeight:'900',fontSize:18},fair:{color:colors.text,fontWeight:'900',fontSize:18},margin:{color:colors.green,fontWeight:'900',fontSize:16,marginTop:8},rationale:{color:'#CDD4D8',fontSize:12,lineHeight:18,marginTop:8},factors:{flexDirection:'row',justifyContent:'space-between',borderTopWidth:1,borderTopColor:colors.line,marginTop:12,paddingTop:10},factor:{color:colors.muted,fontSize:10},factorValue:{color:colors.gold,fontWeight:'800',fontSize:11},reco:{height:46,borderWidth:1,borderColor:'#148C32',backgroundColor:'rgba(13,80,29,.4)',borderRadius:10,alignItems:'center',justifyContent:'center',marginTop:12},recoText:{color:colors.green,fontWeight:'900'},analysis:{height:42,borderWidth:1,borderColor:'#29343B',borderRadius:9,alignItems:'center',justifyContent:'center',marginTop:8},analysisText:{color:colors.text,fontWeight:'800',fontSize:11}});
