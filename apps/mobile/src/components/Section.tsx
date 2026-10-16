import { colors, radius, spacing } from '@op-alpha/design-tokens';
import { PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
export function Section({ title, action, children }: PropsWithChildren<{ title: string; action?: ReactNode }>) {
  return <View style={styles.box}><View style={styles.head}><Text style={styles.title}>{title}</Text>{action}</View>{children}</View>;
}
const styles=StyleSheet.create({box:{borderWidth:1,borderColor:colors.line,borderRadius:radius.lg,backgroundColor:colors.panel,padding:spacing.md,marginBottom:spacing.md},head:{flexWrap:'wrap',gap:8,flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:spacing.md},title:{flexShrink:1,color:colors.text,fontWeight:'900',fontSize:14,letterSpacing:.4}});
