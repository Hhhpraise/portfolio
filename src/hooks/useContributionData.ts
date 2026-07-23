import { useState, useEffect, useRef } from 'react';

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

const LEVEL_MAP: Record<string, 0 | 1 | 2 | 3 | 4> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

interface RawDay {
  date: string;
  contributionCount: number;
  contributionLevel: string;
}

export function useContributionData(username: string) {
  const [days, setDays] = useState<ContributionDay[]>([]);
  const [totalContributions, setTotalContributions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current || !username) return;
    fetched.current = true;

    const fetchData = async () => {
      try {
        const res = await fetch(`https://github-contributions-api.deno.dev/${username}.json`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const data = await res.json();
        const allDays: RawDay[] = (data.contributions as RawDay[][])?.flat() ?? [];

        if (allDays.length === 0) {
          throw new Error('No contribution data returned');
        }

        const contributionDays: ContributionDay[] = allDays.map((d) => ({
          date: d.date,
          count: d.contributionCount,
          level: LEVEL_MAP[d.contributionLevel] ?? 0,
        }));

        const total = contributionDays.reduce((sum, d) => sum + d.count, 0);

        setDays(contributionDays);
        setTotalContributions(total);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load contributions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  return { days, totalContributions, loading, error };
}
