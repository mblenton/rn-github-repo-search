import useSWRInfinite from 'swr/infinite';
import { searchRepositories, GithubSearchResponse } from '@/services/github';

interface UseGithubSearchInfiniteOptions {
  query?: string;
  sort?: string;
  direction?: string;
  per_page?: number;
}

export function useGithubSearchInfinite({
  query = '',
  sort = process.env.EXPO_PUBLIC_GITHUB_DEFAULT_SORT || 'updated',
  direction = process.env.EXPO_PUBLIC_GITHUB_DEFAULT_DIRECTION || 'desc',
  per_page = parseInt(process.env.EXPO_PUBLIC_GITHUB_DEFAULT_PER_PAGE || '30', 10),
}: UseGithubSearchInfiniteOptions) {
  const getKey = (pageIndex: number, previousPageData: GithubSearchResponse | null) => {
    if (!query.trim()) return null;
    if (previousPageData && previousPageData.items.length < per_page) return null;
    if (previousPageData && previousPageData.error) return null;

    const pageNumber = pageIndex + 1;
    return ['github-search', query, sort, direction, pageNumber, per_page];
  };

  const fetcher = (key: [string, string, string, string, number, number]) => {
    const [, q, s, d, p, pp] = key;
    return searchRepositories(q, s, d, p, pp);
  };

  return useSWRInfinite<GithubSearchResponse>(getKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateAll: false,
    revalidateFirstPage: false,
    keepPreviousData: false,
    parallel: false,
    dedupingInterval: 1000,
  });
}
