import { useRef, useState } from 'react';
import { Image, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import type { CatalogPage, HoldingInput } from '@op-alpha/contracts';
import { colors } from '@op-alpha/design-tokens';
import { ScreenFrame, ui } from '../components/ScreenFrame';
import { SectionHeader } from '../components/SectionHeader';
import { StateMessage } from '../components/StateMessage';
import { HoldingForm } from '../components/HoldingForm';
import { CardImage } from '../components/CardImage';
import { addHolding, ApiError, getCards } from '../lib/api';
import { useSession } from '../providers/SessionProvider';

type Choice = { card: CatalogPage['items'][number]; variant: CatalogPage['items'][number]['variants'][number] };

export function ScanScreen() {
  const session = useSession();
  const router = useRouter();
  const client = useQueryClient();
  const [photo, setPhoto] = useState<string>();
  const [photoError, setPhotoError] = useState('');
  const [draft, setDraft] = useState('');
  const [code, setCode] = useState('');
  const [selected, setSelected] = useState<Choice>();
  const [pending, setPending] = useState(false);
  const saving = useRef(false);
  const cards = useQuery({ queryKey: ['scan-cards', code], enabled: !!code && !!session.user && !session.error,
    queryFn: ({ signal }) => getCards({ query: code, page: 1, limit: 24 }, signal) });
  async function pick(camera: boolean) {
    setPhotoError('');
    try {
      if (Platform.OS !== 'web') {
        const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) { setPhotoError('Permita o acesso nas configurações do aparelho ou continue pelo código.'); return; }
      }
      const result = camera ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7, exif: false })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7, exif: false });
      if (!result.canceled) setPhoto(result.assets[0].uri);
    } catch { setPhotoError('Não foi possível abrir a foto. Você pode continuar pelo código da carta.'); }
  }
  async function save(input: HoldingInput) {
    if (saving.current || !session.user) return;
    saving.current = true; setPending(true);
    const userId = session.user.id;
    try {
      await addHolding(input);
      await client.invalidateQueries({ queryKey: ['profile', userId] });
      router.dismissTo('/(tabs)/collection');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) await session.expire(userId);
      throw error;
    } finally { saving.current = false; setPending(false); }
  }
  function search() { setSelected(undefined); setCode(draft.trim()); }
  return <ScreenFrame title="Cadastrar carta" subtitle="Foto e identificação assistida, no seu ritmo.">
    {session.loading ? <StateMessage title="Verificando sessão" loading/>
      : session.error ? <StateMessage title="Não foi possível verificar sua sessão" error message={session.error.message} actionLabel="Tentar novamente" onAction={session.refresh}/>
      : !session.user ? <View style={ui.stack}><StateMessage title="Entre para cadastrar cartas" message="As cartas serão vinculadas à sua conta."/>
        <Link href="/(tabs)/account" style={ui.link}>Entrar na conta</Link></View>
      : <>
        <View style={{ gap: 24 }}>
          <SectionHeader title="01 · Registre a sua carta" caption="A foto é uma referência local e opcional. Nesta versão, a identificação é feita por você pelo código impresso na carta."/>
          <View style={[ui.card, { alignItems: 'center' }]}>
            {photo ? <><Image accessibilityLabel="Foto local da carta" source={{ uri: photo }} style={{ width: 180, height: 252, borderRadius: 20 }} resizeMode="contain"/>
              <Pressable accessibilityRole="button" onPress={() => setPhoto(undefined)} style={ui.secondaryButton}><Text style={ui.label}>Remover foto</Text></Pressable></>
              : <Text style={[ui.text, { paddingVertical: 20 }]}>Sua carta física, sua coleção.</Text>}
            <View style={[ui.row, { justifyContent: 'center' }]}>
              <Pressable accessibilityRole="button" onPress={() => { void pick(false); }} style={ui.secondaryButton}><Text style={ui.label}>Selecionar foto</Text></Pressable>
              {Platform.OS !== 'web' && <Pressable accessibilityRole="button" onPress={() => { void pick(true); }} style={ui.secondaryButton}><Text style={ui.label}>Tirar foto</Text></Pressable>}
            </View>
            <Text style={ui.text}>A foto não é enviada nem salva no servidor.</Text>
            {!!photoError && <Text accessibilityRole="alert" style={ui.error}>{photoError}</Text>}
          </View>
        </View>
        <View style={{ gap: 24 }}>
          <SectionHeader title="02 · Encontre a impressão" caption="Confira código, idioma, coleção e arte antes de confirmar."/>
          <TextInput accessibilityLabel="Código da carta" value={draft} onChangeText={setDraft} maxLength={80} placeholder="Ex.: OP01-001" placeholderTextColor={colors.muted} autoCapitalize="characters" onSubmitEditing={search} style={ui.input}/>
          <Pressable accessibilityRole="button" onPress={search} style={ui.button}><Text style={ui.buttonText}>Buscar impressão</Text></Pressable>
          {!!code && (cards.isPending ? <StateMessage title="Buscando impressões" loading/>
            : cards.isError ? <StateMessage title="Não foi possível buscar" message={cards.error.message} error actionLabel="Tentar novamente" onAction={() => { void cards.refetch(); }}/>
            : !cards.data?.items.length ? <StateMessage title="Carta ainda não disponível" message="O cadastro usa apenas impressões aprovadas. A inclusão de novas cartas no catálogo depende da integração com as fontes."/>
            : <View style={{ gap: 16 }}>
              {cards.data.total > 24 && <Text style={ui.text}>Mostrando os primeiros 24 resultados. Refine a busca com o código completo.</Text>}
              {cards.data.items.flatMap(card => card.variants.map(variant => <Pressable key={variant.id} accessibilityRole="radio"
                accessibilityLabel={`${card.code} · ${variant.variantName} · ${variant.language} · ${variant.set?.code ?? card.set.code}`}
                accessibilityState={{ checked: selected?.variant.id === variant.id }} aria-checked={selected?.variant.id === variant.id} disabled={pending}
                onPress={() => setSelected({ card, variant })} style={[ui.card, ui.row, selected?.variant.id === variant.id && { borderColor: colors.gold }]}>
                <CardImage name={card.name} imageKey={variant.externalKey} imageUrl={variant.imageUrl} width={64} height={90}/>
                <View style={{ flex: 1, gap: 8 }}><Text style={ui.label}>{card.name}</Text><Text style={ui.text}>{card.code} · {variant.variantName}</Text><Text style={ui.text}>{variant.language} · {variant.set?.code ?? card.set.code}</Text></View>
              </Pressable>))}
            </View>)}
        </View>
        {selected && <View style={ui.card}>
          <SectionHeader title="03 · Confirme seu registro" caption={`${selected.card.name} · ${selected.variant.variantName} · ${selected.variant.language}`}/>
          <HoldingForm key={selected.variant.id} variantId={selected.variant.id} pending={pending} onSave={save}/>
        </View>}
      </>}
  </ScreenFrame>;
}
