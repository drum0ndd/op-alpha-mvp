import type { PropsWithChildren } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '@op-alpha/design-tokens';
import { useLens } from '../providers/LensProvider';
import { AccountButton } from './AccountButton';
import { LensBar } from './LensBar';

type Props = PropsWithChildren<{
  title: string; subtitle?: string; showLenses?: boolean; showAccount?: boolean;
  refreshing?: boolean; onRefresh?: () => void;
}>;

export function ScreenFrame({ title, subtitle, children, showLenses = true, showAccount = true, refreshing = false, onRefresh }: Props) {
  const { currentLens } = useLens();
  return <SafeAreaView edges={['top', 'left', 'right']} style={ui.screen}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={ui.content}
      refreshControl={onRefresh ? <RefreshControl tintColor={currentLens.color} refreshing={refreshing} onRefresh={onRefresh}/> : undefined}>
      <View style={ui.header}>{showAccount ? <AccountButton/> : <View/>}<Text style={ui.brand}>OP <Text style={{ color: currentLens.color }}>ALPHA</Text></Text></View>
      {showLenses && <LensBar/>}
      <View style={ui.stack}>
        {showLenses && <Text style={[ui.eyebrow, { color: currentLens.color }]}>VISÃO {currentLens.label.toLocaleUpperCase('pt-BR')}</Text>}
        <Text accessibilityRole="header" style={ui.title}>{title}</Text>
        {!!subtitle && <Text style={ui.text}>{subtitle}</Text>}
      </View>
      {children}
    </ScrollView>
  </SafeAreaView>;
}

export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { width: '100%', maxWidth: 1100, alignSelf: 'center', padding: 20, paddingBottom: 48, gap: spacing.section, flexGrow: 1 },
  header: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  brand: { color: colors.text, fontWeight: '900', fontSize: 19, letterSpacing: 1 },
  title: { color: colors.text, fontSize: 32, fontWeight: '700', letterSpacing: -1 },
  eyebrow: { color: colors.gold, fontSize: 10, letterSpacing: 1.6, fontWeight: '800' },
  text: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  label: { color: colors.text, fontSize: 14, fontWeight: '600' },
  cardTitle: { color: colors.text, fontSize: 19, fontWeight: '700' },
  stack: { gap: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center' },
  card: { padding: 24, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, backgroundColor: colors.panel, gap: 16 },
  input: { minHeight: 52, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: 18, paddingVertical: 14, color: colors.text, backgroundColor: colors.panel, fontSize: 16 },
  button: { minHeight: 52, paddingHorizontal: 22, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.gold },
  buttonText: { color: colors.bg, fontSize: 15, fontWeight: '800' },
  secondaryButton: { minHeight: 48, paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel },
  link: { color: colors.gold, fontSize: 15, minHeight: 44, paddingVertical: 12 },
  error: { color: colors.red, fontSize: 15, lineHeight: 22 },
  form: { width: '100%', maxWidth: 480, alignSelf: 'center', gap: 24 },
});
