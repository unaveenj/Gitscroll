export type RepoCategory = "TRENDING" | "AI" | "TOOLS" | "FUN";

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  category: RepoCategory;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface RepoFeedPage {
  repos: GitHubRepo[];
  nextPage: number | null;
}
