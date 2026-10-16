import type { ProfileResponse } from '@op-alpha/contracts';
export function money(amount: number, currency: string = 'BRL') {
  if (!Number.isFinite(amount) || currency !== 'BRL') return 'Indisponível em reais';
  try { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount); }
  catch { return 'Indisponível (formatação não suportada)'; }
}
export function summarizeProfile(profile: ProfileResponse) {
  const costs: Record<string, number> = {};
  let quantity = 0;
  let withoutCost = 0;
  for (const item of profile.holdings) {
    quantity += item.quantity;
    if (item.acquisitionPrice === null || item.acquisitionCurrency !== 'BRL') withoutCost += item.quantity;
    else {
      // Only recorded BRL costs are summed; legacy amounts are never converted or relabelled.
      const cents = Math.round(Number(item.acquisitionPrice) * 100) * item.quantity;
      costs[item.acquisitionCurrency] = (costs[item.acquisitionCurrency] ?? 0) + cents;
    }
  }
  return { quantity, withoutCost, costs, variants: new Set(profile.holdings.map(item => item.variantId)).size, sets: new Set(profile.holdings.map(item => item.setCode)).size };
}
