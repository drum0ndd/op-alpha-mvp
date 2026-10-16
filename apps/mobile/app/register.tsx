import { useState } from 'react';
import { Link } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { CreateUserSchema } from '@op-alpha/contracts';
import { colors } from '@op-alpha/design-tokens';
import { createUser } from '../src/lib/api';
import { ScreenFrame, ui } from '../src/components/ScreenFrame';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  async function submit() {
    if (pending) return;
    setError('');
    const input = CreateUserSchema.safeParse({ name, email, password });
    if (!input.success) { setError(input.error.issues.map(issue => issue.message).join('\n')); return; }
    setPending(true);
    try { await createUser(input.data); setPassword(''); setSuccess(true); }
    catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível criar a conta.'); }
    finally { setPending(false); }
  }
  return <KeyboardAvoidingView style={ui.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScreenFrame title="Criar conta" subtitle="Uma conta para acompanhar suas cartas." showLenses={false} showAccount={false}>
      <View style={ui.form}>
        <Link href="/(tabs)/account" style={ui.link}>← Voltar ao login</Link>
        {success ? <>
          <Text accessibilityLiveRegion="polite" style={ui.cardTitle}>Conta criada!</Text>
          <Text style={ui.text}>Entre com seu e-mail e senha para acessar sua coleção.</Text>
          <Link href="/(tabs)/account" style={ui.link}>Entrar na conta →</Link>
        </> : <>
          <Text style={ui.label}>Nome</Text>
          <TextInput accessibilityLabel="Nome" autoComplete="name" value={name} onChangeText={setName} maxLength={100} editable={!pending} style={ui.input}/>
          <Text style={ui.label}>E-mail</Text>
          <TextInput accessibilityLabel="E-mail" autoComplete="email" keyboardType="email-address" autoCapitalize="none"
            autoCorrect={false} value={email} onChangeText={setEmail} maxLength={254} editable={!pending} style={ui.input}/>
          <Text style={ui.label}>Senha (12 a 128 caracteres)</Text>
          <TextInput accessibilityLabel="Senha (12 a 128 caracteres)" autoComplete="new-password" secureTextEntry autoCapitalize="none"
            value={password} onChangeText={setPassword} maxLength={128} editable={!pending} style={ui.input} onSubmitEditing={submit}/>
          {!!error && <Text accessibilityRole="alert" style={ui.error}>{error}</Text>}
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: pending, busy: pending }} disabled={pending}
            onPress={submit} style={ui.button}>{pending ? <ActivityIndicator color={colors.bg}/> : <Text style={ui.buttonText}>Criar conta</Text>}</Pressable>
        </>}
      </View>
    </ScreenFrame>
  </KeyboardAvoidingView>;
}
