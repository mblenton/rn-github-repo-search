export interface GithubUser {
  login: string;
  avatar_url: string;
}

export interface GithubRepository {
  id: number;
  name: string;
  owner: GithubUser;
  html_url: string;
  description: string | null;
  updated_at: string;
  stargazers_count: number;
  language: string | null;
}

export interface GithubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GithubRepository[];
  error?: string;
}

export interface GithubRepo extends GithubRepository {}

export async function searchRepositories(
  query: string,
  sort: string = process.env.EXPO_PUBLIC_GITHUB_DEFAULT_SORT || 'updated',
  direction: string = process.env.EXPO_PUBLIC_GITHUB_DEFAULT_DIRECTION || 'desc',
  page: number = 1,
  per_page: number = parseInt(process.env.EXPO_PUBLIC_GITHUB_DEFAULT_PER_PAGE || '30', 10),
): Promise<GithubSearchResponse> {
  if (!query.trim()) {
    return { total_count: 0, incomplete_results: false, items: [] };
  }

  const url = `${process.env.EXPO_PUBLIC_GITHUB_API_BASE_URL || 'https://api.github.com'}/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&direction=${direction}&page=${page}&per_page=${per_page}`;

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };

    if (process.env.EXPO_PUBLIC_GITHUB_API_TOKEN) {
      headers.Authorization = `Bearer ${process.env.EXPO_PUBLIC_GITHUB_API_TOKEN}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'GitHub API error');
    }

    return await response.json();
  } catch (err) {
    console.error('GitHub API request failed:', err);
    return {
      total_count: 0,
      incomplete_results: false,
      items: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
