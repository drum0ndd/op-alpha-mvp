import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@op-alpha/design-tokens';
import { useSession } from '../providers/SessionProvider';

export function AccountButton() {
  const { user, loading } = useSession();
  return <Link href="/(tabs)/account" asChild>
    <Pressable accessibilityRole="link" accessibilityState={{ disabled: loading }} disabled={loading} style={styles.button}>
      <Text style={styles.label}>{loading ? 'Conta…' : user ? 'Minha conta' : 'Login'}</Text>
    </Pressable>
  </Link>;
}

const styles = StyleSheet.create({
  button: { alignSelf: 'flex-start', minHeight: 48, paddingHorizontal: 20, justifyContent: 'center', backgroundColor: colors.gold, borderRadius: 999 },
  label: { color: colors.bg, fontWeight: '800' },
});
