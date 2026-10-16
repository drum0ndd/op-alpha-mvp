import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@op-alpha/design-tokens';
import { useSession } from '../../src/providers/SessionProvider';
import { useLens } from '../../src/providers/LensProvider';

const Icon = ({ name, color }: { name: 'catalog' | 'collection' | 'account'; color: ColorValue }) =>
  <Svg width={23} height={23} viewBox="0 0 24 24" stroke={color} strokeWidth={1.6} fill="none" aria-hidden accessibilityElementsHidden>
    {name === 'catalog' ? <><Rect x={3} y={3} width={7} height={8} rx={2}/><Rect x={14} y={3} width={7} height={8} rx={2}/><Rect x={3} y={15} width={7} height={6} rx={2}/><Rect x={14} y={15} width={7} height={6} rx={2}/></>
      : name === 'collection' ? <><Rect x={5} y={6} width={15} height={15} rx={3}/><Path d="M16 3H6a3 3 0 0 0-3 3v10M9 11h7M9 15h5"/></>
      : <><Circle cx={12} cy={8} r={4}/><Path d="M4 22v-2a8 8 0 0 1 16 0v2"/></>}
  </Svg>;

export default function TabsLayout() {
  const { user } = useSession();
  const { currentLens } = useLens();
  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(insets.bottom, 12);
  return <Tabs screenOptions={{
    headerShown: false,
    tabBarStyle: { backgroundColor: colors.panel, borderTopColor: colors.line, borderTopLeftRadius: 28, borderTopRightRadius: 28, height: 68 + paddingBottom, paddingTop: 12, paddingBottom },
    tabBarActiveTintColor: currentLens.color, tabBarInactiveTintColor: colors.muted,
  }}>
    <Tabs.Screen name="index" options={{ title: 'Catálogo', tabBarIcon: ({ color }) => <Icon color={color} name="catalog"/> }}/>
    <Tabs.Screen name="collection" options={{ title: 'Coleção', tabBarIcon: ({ color }) => <Icon color={color} name="collection"/> }}/>
    <Tabs.Screen name="account" options={{ title: user ? 'Conta' : 'Login', tabBarIcon: ({ color }) => <Icon color={color} name="account"/> }}/>
    <Tabs.Screen name="collector" options={{ href: null }}/>
    <Tabs.Screen name="investor" options={{ href: null }}/>
    <Tabs.Screen name="player" options={{ href: null }}/>
    <Tabs.Screen name="profile" options={{ href: null }}/>
    <Tabs.Screen name="sign-in" options={{ href: null }}/>
    <Tabs.Screen name="watchlist" options={{ href: null }}/>
  </Tabs>;
}
