import { createContext, useContext, useState, type PropsWithChildren } from 'react';
import { colors } from '@op-alpha/design-tokens';

export type UILens = 'COLLECTOR' | 'INVESTOR' | 'PLAYER';
export const lensOptions = [
  { value: 'COLLECTOR', label: 'Colecionador', color: colors.gold },
  { value: 'INVESTOR', label: 'Investidor', color: colors.blue },
  { value: 'PLAYER', label: 'Player', color: colors.purple },
] as const;

type LensContext = { lens: UILens; setLens: (lens: UILens) => void };
const Context = createContext<LensContext | null>(null);

export function LensProvider({ children }: PropsWithChildren) {
  const [lens, setLens] = useState<UILens>('COLLECTOR');
  return <Context.Provider value={{ lens, setLens }}>{children}</Context.Provider>;
}

export function useLens() {
  const value = useContext(Context);
  if (!value) throw new Error('LensProvider ausente.');
  return { ...value, currentLens: lensOptions.find(option => option.value === value.lens)! };
}
