import { useState } from 'react';
import { Link } from 'expo-router';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { LoginSchema } from '@op-alpha/contracts';
import { colors } from '@op-alpha/design-tokens';
import { useSession } from '../providers/SessionProvider';
import { ui } from './ScreenFrame';

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const session = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function submit() {
    if (pending) return;
    setError('');
    const input = LoginSchema.safeParse({ email, password });
    if (!input.success) { setError('Informe um e-mail válido e sua senha.'); return; }
    setPending(true);
    try { await session.signIn(input.data.email, input.data.password); setPassword(''); onSuccess(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível entrar.'); }
    finally { setPending(false); }
  }
  return <View style={ui.form}>
    <Text style={ui.label}>Usuário (e-mail)</Text>
    <TextInput accessibilityLabel="Usuário (e-mail)" autoComplete="username" keyboardType="email-address"
      autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} maxLength={254}
      editable={!pending} style={ui.input}/>
    <Text style={ui.label}>Senha</Text>
    <TextInput accessibilityLabel="Senha" autoComplete="current-password" secureTextEntry autoCapitalize="none"
      value={password} onChangeText={setPassword} maxLength={128} editable={!pending} style={ui.input} onSubmitEditing={submit}/>
    {!!error && <Text accessibilityRole="alert" style={ui.error}>{error}</Text>}
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: pending, busy: pending }} disabled={pending}
      onPress={submit} style={ui.button}>{pending ? <ActivityIndicator color={colors.bg}/> : <Text style={ui.buttonText}>Entrar</Text>}</Pressable>
    <Link href="/register" style={ui.link}>Criar uma conta →</Link>
  </View>;
}
