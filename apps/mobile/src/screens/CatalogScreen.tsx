import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { colors } from '@op-alpha/design-tokens';
import { getCards } from '../lib/api';
import { CatalogCardTile } from '../components/CatalogCardTile';
import { CatalogHero } from '../components/CatalogHero';
import { SectionHeader } from '../components/SectionHeader';
import { ScreenFrame, ui } from '../components/ScreenFrame';
import { StateMessage } from '../components/StateMessage';

const languages = [
  { value: '', label: 'Todos' }, { value: 'EN', label: 'Inglês' },
  { value: 'JP', label: 'Japonês' }, { value: 'PT', label: 'Português' },
] as const;
const first = (value?: string | string[]) => Array.isArray(value) ? value[0] ?? '' : value ?? '';

export function CatalogScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ query?: string | string[]; set?: string | string[]; language?: string | string[]; page?: string | string[] }>();
  const search = first(params.query).slice(0, 80);
  const set = first(params.set).slice(0, 20);
  const language = languages.find(option => option.value === first(params.language))?.value ?? '';
  const requestedPage = Number(first(params.page));
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 100000) : 1;
  const [draft, setDraft] = useState(search);
  const [draftSet, setDraftSet] = useState(set);
  const [draftLanguage, setDraftLanguage] = useState(language);
  useEffect(() => { setDraft(search); setDraftSet(set); setDraftLanguage(language); }, [search, set, language]);
  const query = useQuery({
    queryKey: ['catalog', search, set, language, page],
    queryFn: ({ signal }) => getCards({ query: search, set, language: language || undefined, page, limit: 24 }, signal),
  });
  const submit = () => router.setParams({ query: draft.trim(), set: draftSet.trim().toUpperCase(), language: draftLanguage, page: '1' });
  const { width } = useWindowDimensions();
  const columns = width >= 960 ? 4 : width >= 600 ? 3 : 2;
  const cardWidth = (Math.min(width, 1100) - 40 - 12 * (columns - 1)) / columns;

  return <ScreenFrame title="Catálogo" subtitle="Encontre cartas e explore suas impressões.">
    <CatalogHero/>
    <View style={{ gap: 18 }}>
      <SectionHeader title="Encontre sua próxima carta" caption="Busque pelo nome, código ou coleção."/>
      <TextInput accessibilityLabel="Buscar por nome ou código" value={draft} onChangeText={setDraft}
        placeholder="Nome ou código da carta" placeholderTextColor={colors.muted} maxLength={80}
        returnKeyType="search" onSubmitEditing={submit} style={ui.input}/>
      <View style={ui.row}>
        <View style={{ flex: 1, minWidth: 120, gap: 8 }}>
          <Text style={ui.label}>Set</Text>
          <TextInput accessibilityLabel="Código do set" value={draftSet} onChangeText={setDraftSet}
            placeholder="Todos os sets" placeholderTextColor={colors.muted} maxLength={20}
            autoCapitalize="characters" onSubmitEditing={submit} style={ui.input}/>
        </View>
        <Pressable accessibilityRole="button" onPress={submit} style={[ui.button, { minWidth: 100, alignSelf: 'flex-end' }]}>
          <Text style={ui.buttonText}>Buscar</Text>
        </Pressable>
      </View>
      <Text style={ui.label}>Idioma</Text>
      <View style={styles.languages}>{languages.map(option => <Pressable key={option.value} accessibilityRole="radio"
        accessibilityState={{ checked: draftLanguage === option.value }} aria-checked={draftLanguage === option.value} onPress={() => setDraftLanguage(option.value)}
        style={[styles.language, draftLanguage === option.value && styles.selected]}>
        <Text style={[ui.text, draftLanguage === option.value && { color: colors.gold }]}>{option.label}</Text>
      </Pressable>)}</View>
    </View>
    {query.isPending ? <StateMessage title="Carregando cartas" loading/>
      : query.isError ? <StateMessage title="Não foi possível carregar o catálogo" message={query.error.message}
        error actionLabel="Tentar novamente" onAction={() => { void query.refetch(); }}/>
      : query.data && <>
        <SectionHeader title="Explore as cartas" caption={`${query.data.total} cartas encontradas`}/>
        {!query.data.items.length ? query.data.total > 0
          ? <StateMessage title="Página indisponível" message="Há cartas para estes filtros, mas esta página não existe. Volte à primeira página para ver os resultados."
            actionLabel="Voltar à primeira página" onAction={() => router.setParams({ page: '1' })}/>
          : <StateMessage title="Nenhuma carta encontrada" message="Tente outro nome ou ajuste os filtros."/>
          : <View style={styles.grid}>{query.data.items.map(card => <CatalogCardTile key={card.id} card={card} width={cardWidth}/>)}</View>}
        {query.data.items.length > 0 && query.data.totalPages > 1 && <View style={[ui.row, { justifyContent: 'space-between' }]}>
          <Pressable accessibilityRole="button" disabled={page <= 1 || query.isFetching}
            accessibilityState={{ disabled: page <= 1 || query.isFetching }}
            onPress={() => router.setParams({ page: String(page - 1) })} style={[ui.secondaryButton, page <= 1 && styles.disabled]}>
            <Text style={ui.label}>Anterior</Text>
          </Pressable>
          <Text style={ui.text}>{page} / {query.data.totalPages}</Text>
          <Pressable accessibilityRole="button" disabled={page >= query.data.totalPages || query.isFetching}
            accessibilityState={{ disabled: page >= query.data.totalPages || query.isFetching }}
            onPress={() => router.setParams({ page: String(page + 1) })} style={[ui.secondaryButton, page >= query.data.totalPages && styles.disabled]}>
            <Text style={ui.label}>Próxima</Text>
          </Pressable>
        </View>}
      </>}
  </ScreenFrame>;
}

const styles = StyleSheet.create({
  languages: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  language: { minHeight: 44, paddingHorizontal: 16, justifyContent: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: 999 },
  selected: { borderColor: colors.gold, backgroundColor: colors.panel2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, rowGap: 28 },
  disabled: { opacity: .4 },
});
