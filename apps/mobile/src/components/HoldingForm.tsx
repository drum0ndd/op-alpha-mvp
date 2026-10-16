import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { HoldingInputSchema, type HoldingInput } from '@op-alpha/contracts';
import { colors } from '@op-alpha/design-tokens';
import { ui } from './ScreenFrame';

const conditions = [
  ['NM', 'Quase nova'], ['LP', 'Pouco uso'], ['MP', 'Uso moderado'], ['HP', 'Muito uso'], ['DMG', 'Danificada'],
] as const;

export function HoldingForm({ variantId, pending, onSave }: { variantId: string; pending: boolean; onSave: (input: HoldingInput) => Promise<void> }) {
  const [quantity, setQuantity] = useState('1');
  const [condition, setCondition] = useState<HoldingInput['condition']>('NM');
  const [cost, setCost] = useState('');
  const [error, setError] = useState('');
  async function submit() {
    const price = cost.trim().replace(',', '.');
    const parsed = HoldingInputSchema.safeParse({ variantId, quantity: /^\d+$/.test(quantity) ? Number(quantity) : NaN, condition,
      acquisitionPrice: price || null, acquisitionCurrency: price ? 'BRL' : null });
    if (!parsed.success) { setError('Use quantidade de 1 a 10.000 e custo como 12,50, sem separador de milhar.'); return; }
    setError('');
    try { await onSave(parsed.data); } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível salvar a carta.'); }
  }
  return <View style={{ gap: 20 }}>
    <Text style={ui.label}>Quantidade</Text>
    <TextInput accessibilityLabel="Quantidade" value={quantity} onChangeText={setQuantity} editable={!pending} keyboardType="number-pad" maxLength={5} style={ui.input}/>
    <Text style={ui.label}>Condição da carta</Text>
    <View style={ui.row}>{conditions.map(([value, label]) => <Pressable key={value} accessibilityRole="radio" accessibilityLabel={`${value} · ${label}`}
      accessibilityState={{ checked: condition === value, disabled: pending }} aria-checked={condition === value} disabled={pending} onPress={() => setCondition(value)}
      style={[ui.secondaryButton, condition === value && { borderColor: colors.gold }]}><Text style={ui.label}>{value} · {label}</Text></Pressable>)}</View>
    <Text style={ui.label}>Custo unitário em R$ (opcional)</Text>
    <TextInput accessibilityLabel="Custo unitário em reais" value={cost} onChangeText={setCost} editable={!pending} keyboardType="decimal-pad" maxLength={13}
      placeholder="Ex.: 12,50" placeholderTextColor={colors.muted} style={ui.input}/>
    <Text style={ui.text}>Este é o valor que você pagou, não uma cotação de mercado.</Text>
    {!!error && <Text accessibilityRole="alert" style={ui.error}>{error}</Text>}
    <Pressable accessibilityRole="button" disabled={pending} accessibilityState={{ busy: pending, disabled: pending }} onPress={() => { void submit(); }} style={ui.button}>
      <Text style={ui.buttonText}>{pending ? 'Salvando…' : 'Adicionar à coleção'}</Text>
    </Pressable>
  </View>;
}
