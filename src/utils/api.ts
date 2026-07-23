import { CONFIG } from '../config';
import type { Project, Publication } from '../types';

export function formatFileSize(bytes: number): string {
  if (!bytes) return '';
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export async function fetchGitHubProjects(): Promise<{ projects: Project[]; user: { public_repos: number; followers: number } }> {
  const [reposRes, userRes] = await Promise.all([
    fetch(`https://api.github.com/users/${CONFIG.GITHUB_USER}/repos?per_page=100&sort=updated`),
    fetch(`https://api.github.com/users/${CONFIG.GITHUB_USER}`),
  ]);

  if (!reposRes.ok) throw new Error('GitHub API error');

  const repos = await reposRes.json();
  const user = await userRes.json();

  if (!Array.isArray(repos)) throw new Error('Invalid response');

  const projects: Project[] = repos
    .filter((r: any) => !r.fork)
    .map((r: any) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      html_url: r.html_url,
      description: r.description || 'No description',
      language: r.language || 'Code',
      stargazers_count: r.stargazers_count,
      forks_count: r.forks_count,
      topics: r.topics || [],
      homepage: r.homepage,
      has_pages: r.has_pages,
      updated_at: r.updated_at,
      hasLiveDemo: r.has_pages ? true : !!r.homepage,
      liveDemo: r.has_pages
        ? `https://${CONFIG.GITHUB_USER}.github.io/${r.name}/`
        : r.homepage || null,
      hasDownload: false,
      downloadUrl: undefined,
      downloadSize: undefined,
    }));

  // Check for downloadable releases
  const toCheck = projects.filter(
    (p) => p.topics.includes('executable') || CONFIG.EXECUTABLE_ALLOWLIST.includes(p.name)
  );

  if (toCheck.length > 0) {
    await Promise.allSettled(
      toCheck.map((p) =>
        fetch(`https://api.github.com/repos/${CONFIG.GITHUB_USER}/${p.name}/releases/latest`)
          .then((r) => (r.ok ? r.json() : null))
          .then((release) => {
            if (release?.assets?.length > 0) {
              p.hasDownload = true;
              p.downloadUrl = release.assets[0].browser_download_url;
              p.downloadSize = formatFileSize(release.assets[0].size);
            }
          })
          .catch(() => {})
      )
    );
  }

  projects.sort((a, b) => b.stargazers_count - a.stargazers_count);

  return { projects, user: { public_repos: user.public_repos, followers: user.followers } };
}

export async function fetchPublications(): Promise<Publication[]> {
  const res = await fetch(`https://pub.orcid.org/v3.0/${CONFIG.ORCID_ID}/works`, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) throw new Error('ORCID API error');

  const data = await res.json();
  const works = (data.group || [])
    .map((group: any) => {
      const summary = group['work-summary']?.[0];
      if (!summary) return null;
      const extIds = summary['external-ids']?.['external-id'] || [];
      const doi = extIds.find((id: any) => id['external-id-type'] === 'doi');
      return {
        title: summary.title?.title?.value || 'Untitled',
        journal: summary['journal-title']?.value || '',
        year: summary['publication-date']?.year?.value || '',
        doi: doi ? doi['external-id-value'] : null,
        url: doi ? `https://doi.org/${doi['external-id-value']}` : null,
      };
    })
    .filter(Boolean)
    .sort((a: Publication, b: Publication) => (b.year ? Number(b.year) : 0) - (a.year ? Number(a.year) : 0));

  return works;
}
