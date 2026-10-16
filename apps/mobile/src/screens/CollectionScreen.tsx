import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { AccountLayout } from '../components/AccountLayout';
import { CardImage } from '../components/CardImage';
import { StateMessage } from '../components/StateMessage';
import { ui } from '../components/ScreenFrame';
import { money } from '../lib/profile';

export function CollectionScreen() {
  return <AccountLayout title="Minha coleção">{profile => <>
    <View style={[ui.row, { justifyContent: 'space-between' }]}>
      <View style={ui.stack}><Text style={ui.eyebrow}>SEU ACERVO</Text><Text style={ui.cardTitle}>{profile.holdings.reduce((sum, item) => sum + item.quantity, 0)} cartas</Text><Text style={ui.text}>{profile.holdings.length} {profile.holdings.length === 1 ? 'registro' : 'registros'} na coleção</Text></View>
      <Link href="/scan" asChild><Pressable accessibilityRole="link" style={ui.button}><Text style={ui.buttonText}>＋ Cadastrar carta</Text></Pressable></Link>
    </View>
    {!profile.holdings.length ? <>
      <StateMessage title="Sua coleção começa aqui" message="Selecione uma foto, encontre a carta pelo código e confirme a impressão para começar."/>
      <Link href="/(tabs)" style={ui.link}>Explorar catálogo →</Link>
    </> : profile.holdings.map(item => <View key={item.id} style={[ui.card, ui.row, { alignItems: 'flex-start' }]}>
      <CardImage name={item.name} imageKey={item.imageKey} imageUrl={item.imageUrl} width={70} height={98}/>
      <View style={[ui.stack, { flex: 1, minWidth: 120 }]}>
        <Text style={ui.cardTitle}>{item.name}</Text>
        <Text style={ui.text}>{item.cardCode} · {item.variant} · {item.language}</Text>
        <Text style={ui.text}>{item.setCode} · {item.setName}</Text>
        <Text style={ui.label}>{item.quantity} {item.quantity === 1 ? 'cópia' : 'cópias'} · Condição {item.condition}</Text>
        <Text style={ui.text}>Custo unitário: {item.acquisitionPrice !== null && item.acquisitionCurrency === 'BRL' ? money(Number(item.acquisitionPrice), 'BRL') : 'Não informado'}</Text>
      </View>
    </View>)}
  </>}</AccountLayout>;
}
