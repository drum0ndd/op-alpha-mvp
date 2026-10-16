import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { getCard } from '../lib/api';
import { CardImage } from '../components/CardImage';
import { ScreenFrame, ui } from '../components/ScreenFrame';
import { StateMessage } from '../components/StateMessage';
import { SectionHeader } from '../components/SectionHeader';

export function CardDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = (Array.isArray(params.id) ? params.id[0] : params.id) ?? '';
  const router = useRouter();
  const query = useQuery({ queryKey: ['card', id], queryFn: ({ signal }) => getCard(id, signal), enabled: !!id });
  const card = query.data;
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(300, Math.max(200, width - 40));
  const imageWidth = cardWidth - 50;
  const back = () => router.canGoBack() ? router.back() : router.replace('/(tabs)');
  return <ScreenFrame title={card?.name ?? 'Carta'} subtitle={card?.code}>
    <Pressable accessibilityRole="button" onPress={back} style={[ui.secondaryButton, { alignSelf: 'flex-start' }]}>
      <Text style={ui.label}>← Voltar ao catálogo</Text>
    </Pressable>
    {!id ? <StateMessage title="Carta não informada" message="Volte ao catálogo para escolher uma carta." error/>
      : query.isPending ? <StateMessage title="Carregando carta" loading/>
      : query.isError ? <StateMessage title="Não foi possível abrir a carta" message={query.error.message}
        error actionLabel="Tentar novamente" onAction={() => { void query.refetch(); }}/>
      : card && <>
        <View style={ui.card}>
          <Text style={ui.cardTitle}>{card.set.name}</Text>
          <Text style={ui.text}>Raridade: {card.rarity ?? 'Não informada'}</Text>
          <Text style={ui.text}>Cor: {card.color ?? 'Não informada'} · Tipo: {card.cardType ?? 'Não informado'}</Text>
        </View>
        <SectionHeader title="Impressões" caption="A mesma carta pode ter diferentes artes, idiomas e coleções."/>
        <View style={[ui.row, { alignItems: 'stretch' }]}>{card.variants.map(variant => <View key={variant.id} style={[ui.card, { width: cardWidth }]}>
          <CardImage name={card.name} imageKey={variant.externalKey} imageUrl={variant.imageUrl}
            width={imageWidth} height={imageWidth * 1.4}/>
          <Text style={ui.cardTitle}>{variant.variantName}</Text>
          <Text style={ui.text}>{variant.language} · {variant.set?.name ?? card.set.name}</Text>
        </View>)}</View>
      </>}
  </ScreenFrame>;
}
