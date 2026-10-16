import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import type { CatalogPage } from '@op-alpha/contracts';
import { colors } from '@op-alpha/design-tokens';
import { CardImage } from './CardImage';
import { ui } from './ScreenFrame';

export function CatalogCardTile({ card, width }: { card: CatalogPage['items'][number]; width: number }) {
  const variant = card.variants[0];
  return <Link href={{ pathname: '/cards/[id]', params: { id: card.id } }} asChild>
    <Pressable accessibilityRole="link" accessibilityLabel={card.name + ', ' + card.code} style={{ width, gap: 12, paddingBottom: 12 }}>
      <View style={{ alignItems: 'center', padding: 10, backgroundColor: colors.panel, borderRadius: 24 }}>
        <CardImage name={card.name} imageKey={variant?.externalKey} imageUrl={variant?.imageUrl} width={width - 20} height={(width - 20) * 1.4}/>
      </View>
      <View style={{ gap: 5, paddingHorizontal: 4 }}>
        <Text numberOfLines={2} style={[ui.label, { minHeight: 36 }]}>{card.name}</Text>
        <Text style={[ui.text, { fontSize: 12 }]}>{card.code} · {card.rarity ?? 'Carta'}</Text>
        <Text style={[ui.text, { fontSize: 12 }]}>{card.variants.length} {card.variants.length === 1 ? 'impressão' : 'impressões'}</Text>
      </View>
    </Pressable>
  </Link>;
}
