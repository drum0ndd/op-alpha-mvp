import { useState } from 'react';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { useSession } from '../providers/SessionProvider';
import { LoginForm } from '../components/LoginForm';
import { ScreenFrame, ui } from '../components/ScreenFrame';
import { StateMessage } from '../components/StateMessage';
import { colors } from '@op-alpha/design-tokens';
import { LinearGradient } from 'expo-linear-gradient';

export function AccountScreen() {
  const session = useSession();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function exit() {
    if (pending) return;
    setPending(true); setError('');
    try { await session.signOut(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível sair.'); }
    finally { setPending(false); }
  }
  const authenticated = !!session.user && !session.error;
  return <KeyboardAvoidingView style={ui.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScreenFrame title={authenticated ? 'Minha conta' : 'Login'} subtitle={authenticated ? 'Seus dados de acesso.' : 'Entre para consultar sua coleção.'}>
      {session.loading ? <StateMessage title="Verificando sessão" loading/> : authenticated && session.user ? <View style={ui.form}>
        <LinearGradient colors={['#302810', '#10161B', '#0B0F12']} style={[ui.card, { paddingTop: 32, paddingBottom: 32, borderRadius: 32 }]}>
          <View style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: colors.gold, backgroundColor: colors.panel, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <Text style={{ color: colors.gold, fontSize: 32, fontWeight: '700' }}>{session.user.name.trim().slice(0, 1).toLocaleUpperCase('pt-BR')}</Text>
          </View>
          <Text style={[ui.title, { fontSize: 28 }]}>{session.user.name}</Text>
          <Text selectable style={ui.text}>{session.user.email}</Text>
          <Text style={ui.text}>Membro desde {new Date(session.user.createdAt).toLocaleDateString('pt-BR')}</Text>
        </LinearGradient>
        {!!error && <Text accessibilityRole="alert" style={ui.error}>{error}</Text>}
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: pending, busy: pending }} disabled={pending}
          onPress={exit} style={ui.secondaryButton}><Text style={ui.label}>{pending ? 'Saindo…' : 'Sair da conta'}</Text></Pressable>
      </View> : <>
        {session.error && <StateMessage title="Não foi possível verificar sua sessão" message={session.error.message}
          error actionLabel="Tentar novamente" onAction={session.refresh}/>}
        <LoginForm onSuccess={() => router.replace('/(tabs)/collection')}/>
      </>}
    </ScreenFrame>
  </KeyboardAvoidingView>;
}
