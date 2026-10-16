import { Redirect, useLocalSearchParams } from 'expo-router';
export default function LegacyCatalogRoute() {
  const params = useLocalSearchParams();
  return <Redirect href={{ pathname: '/(tabs)', params }}/>;
}
