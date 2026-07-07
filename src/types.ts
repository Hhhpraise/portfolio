export interface Project {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  homepage: string | null;
  has_pages: boolean;
  updated_at: string;
  hasLiveDemo?: boolean;
  liveDemo?: string;
  hasDownload?: boolean;
  downloadUrl?: string;
  downloadSize?: string;
}

export interface Publication {
  title: string;
  journal: string;
  year: string;
  doi: string | null;
  url: string | null;
}

export interface GitHubUser {
  public_repos: number;
  followers: number;
}

export interface CatalogState {
  currentPage: number;
  currentFilter: string;
  searchQuery: string;
  sortBy: 'stars' | 'updated' | 'name';
}
