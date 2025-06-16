import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { TextInput } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDebounce } from 'use-debounce';
import { useGithubSearchInfinite } from '@/hooks/useGithubSearch';
import { GithubRepository } from '@/services/github';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export default function ResultsScreen() {
  const { q } = useLocalSearchParams();
  const router = useRouter();
  const initialQuery = typeof q === 'string' ? q : '';
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    if (typeof q === 'string' && q !== query) {
      setQuery(q);
    } else if (typeof q !== 'string' && query !== '') {
      setQuery('');
    }
    setHasReachedEnd(false);
  }, [q]);

  const [debouncedQuery] = useDebounce(query, 300);

  const sort = process.env.EXPO_PUBLIC_GITHUB_DEFAULT_SORT || 'updated';
  const direction = process.env.EXPO_PUBLIC_GITHUB_DEFAULT_DIRECTION || 'desc';
  const per_page = parseInt(process.env.EXPO_PUBLIC_GITHUB_DEFAULT_PER_PAGE || '30', 10);

  useEffect(() => {
    setHasReachedEnd(false);
    if (debouncedQuery.trim() !== '') {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [debouncedQuery]);

  const { data, error, isLoading, isValidating, size, setSize, mutate } = useGithubSearchInfinite({
    query: debouncedQuery,
    sort,
    direction,
    per_page,
  });

  const items = useMemo(() => {
    if (!data) return [];

    const seenIds = new Set<number>();
    const uniqueItems: GithubRepository[] = [];

    for (const page of data) {
      if (page?.items && Array.isArray(page.items)) {
        for (const item of page.items) {
          if (item && !seenIds.has(item.id)) {
            seenIds.add(item.id);
            uniqueItems.push(item);
          }
        }
      }
    }

    return uniqueItems;
  }, [data]);

  const noMoreResults = useMemo(() => {
    if (!data || data.length === 0) return false;
    const lastPage = data[data.length - 1];
    return lastPage && lastPage.items.length < per_page;
  }, [data, per_page]);

  const handleClear = () => setQuery('');

  const handleRepositoryPress = (repository: GithubRepository) => {
    router.push({
      pathname: '/repository/[id]',
      params: {
        id: repository.id.toString(),
        data: JSON.stringify(repository),
      },
    });
  };

  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const listRef = useRef<FlashList<GithubRepository>>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    if (!debouncedQuery.trim()) return;

    setRefreshing(true);
    try {
      setSize(1);
      await mutate();
      setHasReachedEnd(false);
    } finally {
      setRefreshing(false);
    }
  };

  const canRefresh = debouncedQuery.trim() !== '';

  const handleEndReached = () => {
    if (!isValidating && !noMoreResults && debouncedQuery.trim() !== '') {
      setSize(size + 1);
    }
    setHasReachedEnd(true);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isAtEnd =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    if (!isAtEnd && hasReachedEnd) {
      setHasReachedEnd(false);
    }
  };

  const keyExtractor = (item: GithubRepository) => item.id.toString();

  const renderItem = React.useCallback(
    ({ item }: { item: GithubRepository }) => (
      <Pressable
        style={({ pressed }) => [styles.repoItem, pressed && styles.repoItemPressed]}
        onPress={() => handleRepositoryPress(item)}
      >
        <Text style={styles.repoName}>{item.name}</Text>
        <Text style={styles.repoDesc}>
          Last updated: {dayjs(item.updated_at).utc().format('DD.MM.YYYY. HH:mm:ss')} UTC
        </Text>
      </Pressable>
    ),
    [handleRepositoryPress],
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        mode="outlined"
        placeholder="Search GitHub repositories..."
        value={query}
        onChangeText={setQuery}
        right={query ? <TextInput.Icon icon="close" onPress={handleClear} /> : null}
        returnKeyType="search"
      />
      <View style={styles.results}>
        {isLoading && <ActivityIndicator size="large" style={{ marginTop: 32 }} />}
        {error && <Text style={styles.error}>{error.message || String(error)}</Text>}
        {data && data[0]?.error && <Text style={styles.error}>{data[0].error}</Text>}
        {!isLoading && !error && items.length === 0 && debouncedQuery.trim() !== '' && (
          <Text style={styles.noResults}>No repositories found.</Text>
        )}
        <FlashList
          ref={listRef}
          data={items}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          estimatedItemSize={68}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          onScroll={handleScroll}
          refreshing={canRefresh ? refreshing : false}
          onRefresh={canRefresh ? onRefresh : undefined}
          ListFooterComponent={
            isValidating && items.length > 0 ? (
              <View style={styles.paginationLoader}>
                <ActivityIndicator size="large" color="#2f95dc" />
                <Text style={styles.loadingText}>Loading more repositories...</Text>
              </View>
            ) : noMoreResults && items.length > 0 && !isValidating ? (
              <View style={styles.endMessage}>
                <Text style={styles.footerText}>No more results</Text>
              </View>
            ) : null
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    marginBottom: 16,
  },
  results: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  repoItem: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: 8,
  },
  repoItemPressed: {
    backgroundColor: '#f0f0f0',
  },
  repoName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  repoDesc: {
    color: '#555',
    fontSize: 14,
    marginTop: 2,
  },
  error: {
    color: 'red',
    marginVertical: 16,
    textAlign: 'center',
  },
  noResults: {
    color: '#888',
    marginVertical: 16,
    textAlign: 'center',
  },
  footerText: {
    color: '#888',
    marginVertical: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  paginationLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderTopColor: '#e9ecef',
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },
  endMessage: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderTopColor: '#e9ecef',
  },
});
