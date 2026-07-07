import { useEffect, useRef, useState } from 'react';
import type { Project, Publication } from '../types';
import { fetchGitHubProjects, fetchPublications } from '../utils/api';

interface GitHubData {
  projects: Project[];
  user: { public_repos: number; followers: number };
  loading: boolean;
  error: string | null;
}

export function useGitHubData(): GitHubData {
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState({ public_repos: 0, followers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    fetchGitHubProjects()
      .then((data) => {
        setProjects(data.projects);
        setUser(data.user);
        setLoading(false);
      })
      .catch((err) => {
        console.error('GitHub fetch error:', err);
        setError('Could not load projects. Rate limit may apply.');
        setLoading(false);
      });
  }, []);

  return { projects, user, loading, error };
}

interface PublicationsData {
  publications: Publication[];
  loading: boolean;
  error: string | null;
}

export function usePublications(): PublicationsData {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    fetchPublications()
      .then((pubs) => {
        setPublications(pubs);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Publications error:', err);
        setError('Could not load publications.');
        setLoading(false);
      });
  }, []);

  return { publications, loading, error };
}
