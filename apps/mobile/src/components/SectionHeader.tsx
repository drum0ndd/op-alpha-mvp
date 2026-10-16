import { Text, View } from 'react-native';
import { ui } from './ScreenFrame';

export function SectionHeader({ title, caption }: { title: string; caption?: string }) {
  return <View style={ui.stack}><Text accessibilityRole="header" style={ui.cardTitle}>{title}</Text>
    {!!caption && <Text style={ui.text}>{caption}</Text>}</View>;
}
