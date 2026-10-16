import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { colors } from '@op-alpha/design-tokens';
import { ui } from './ScreenFrame';

export function StateMessage({ title, message, loading, error, actionLabel, onAction }: {
  title: string; message?: string; loading?: boolean; error?: boolean; actionLabel?: string; onAction?: () => void;
}) {
  return <View style={[ui.card, { paddingVertical: 28 }]}>
    {loading && <ActivityIndicator accessibilityLabel={title} color={colors.gold}/>}
    <Text accessibilityRole={error ? 'alert' : 'header'} style={error ? ui.error : ui.cardTitle}>{title}</Text>
    {!!message && <Text style={ui.text}>{message}</Text>}
    {!!actionLabel && onAction && <Pressable accessibilityRole="button" onPress={onAction} style={ui.secondaryButton}><Text style={ui.label}>{actionLabel}</Text></Pressable>}
  </View>;
}
