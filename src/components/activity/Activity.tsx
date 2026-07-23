import { useMemo } from 'react';
import { useGSAP, gsap } from '../../hooks/useGSAP';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useContributionData, type ContributionDay } from '../../hooks/useContributionData';

const GITHUB_USER = 'Hhhpraise';

const LEVEL_COLORS: Record<number, string> = {
  0: 'rgba(255,255,255,0.04)',
  1: 'rgba(255,61,0,0.18)',
  2: 'rgba(255,61,0,0.38)',
  3: 'rgba(255,61,0,0.65)',
  4: '#ff3d00',
};

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function HeatmapCell({ day }: { day: ContributionDay }) {
  const date = new Date(day.date + 'T12:00:00');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const dayNum = date.getDate();
  const title = `${day.count} contribution${day.count !== 1 ? 's' : ''} on ${month} ${dayNum}`;

  return (
    <div
      className="heatmap-cell"
      style={{
        width: '100%',
        paddingBottom: '100%',
        borderRadius: 2,
        backgroundColor: LEVEL_COLORS[day.level],
        position: 'relative',
        transition: 'transform 0.1s ease',
      }}
      title={title}
    />
  );
}

export default function Activity() {
  const reducedMotion = useReducedMotion();
  const { days, totalContributions, loading } = useContributionData(GITHUB_USER);

  const { weeks, monthLabels, bestStreak } = useMemo(() => {
    if (days.length === 0) {
      return { weeks: [] as ContributionDay[][], monthLabels: [] as { label: string; col: number }[], bestStreak: 0 };
    }

    const firstDay = new Date(days[0].date + 'T12:00:00');
    const startDayOfWeek = firstDay.getDay();

    const dayMap = new Map<string, ContributionDay>();
    days.forEach(d => dayMap.set(d.date, d));

    const weeks: ContributionDay[][] = [];
    const labels: { label: string; col: number }[] = [];

    // Build weeks starting from the first Sunday before the first data day.
    // Each row = one week (Sun–Sat), each column index = week number.
    const gridStart = new Date(firstDay);
    gridStart.setDate(gridStart.getDate() - startDayOfWeek);

    const totalDays = days.length + startDayOfWeek;
    const numWeeks = Math.ceil(totalDays / 7);

    // First pass: collect all weeks
    const weekDates: Date[][] = [];
    for (let w = 0; w < numWeeks; w++) {
      const week: ContributionDay[] = [];
      const dates: Date[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(gridStart);
        date.setDate(date.getDate() + w * 7 + d);
        dates.push(date);
        const key = date.toISOString().split('T')[0];
        week.push(dayMap.get(key) ?? { date: key, count: 0, level: 0 as const });
      }
      weeks.push(week);
      weekDates.push(dates);
    }

    // Month labels: place at the column where the month's *first day* visually appears.
    // Check every column (week) for any day belonging to a new month.
    for (let w = 0; w < numWeeks; w++) {
      const dates = weekDates[w];
      for (let d = 0; d < 7; d++) {
        const date = dates[d];
        const month = date.toLocaleString('en-US', { month: 'short' });
        const prevLabel = labels.length > 0 ? labels[labels.length - 1].label : '';
        if (month !== prevLabel) {
          labels.push({ label: month, col: w });
          break;
        }
      }
    }

    // Remove any label that lands within the first 2 columns — it's too cramped
    // to read and the first month is obvious from the grid start position.
    if (labels.length > 0 && labels[0].col <= 1) {
      labels.shift();
    }

    // Calculate best streak
    let streak = 0;
    let maxStreak = 0;
    for (const d of days) {
      if (d.count > 0) { streak++; maxStreak = Math.max(maxStreak, streak); }
      else { streak = 0; }
    }

    return { weeks, monthLabels: labels, bestStreak: maxStreak };
  }, [days]);

  const sectionRef = useGSAP<HTMLElement>((ref) => {
    if (!ref.current || reducedMotion) return;
    gsap.from(ref.current.querySelector('.section-label'), { scrollTrigger: { trigger: ref.current, start: 'top 80%' }, opacity: 0, y: 20, duration: 0.5 });
    gsap.from(ref.current.querySelector('.section-title'), { scrollTrigger: { trigger: ref.current, start: 'top 80%' }, opacity: 0, y: 30, duration: 0.6, delay: 0.1 });

    gsap.from(ref.current.querySelectorAll('.heatmap-cell'), {
      scrollTrigger: { trigger: ref.current, start: 'top 70%' },
      opacity: 0, scale: 0, duration: 0.35,
      stagger: { each: 0.0012, from: 'random' },
      ease: 'power2.out',
    });

    gsap.from(ref.current.querySelectorAll('.activity-stat'), {
      scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      opacity: 0, y: 24, duration: 0.6, stagger: 0.1, delay: 0.3, ease: 'power3.out',
    });
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} id="activity">
      <div className="container">
        <span className="section-label">Activity</span>
        <h2 className="section-title">Open-source rhythm.</h2>

        {loading ? (
          <div className="mt-12 bg-bg-elevated border border-border rounded-[20px] flex items-center justify-center py-20">
            <div className="loading-spinner" />
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-stretch">
            {/* Left — stat spotlight */}
            <div className="bg-bg-elevated border border-border rounded-[20px] p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-accent opacity-[0.04] -translate-y-1/2 translate-x-1/2" />

              <div>
                <div className="activity-stat mb-8">
                  <span className="font-display text-[clamp(3.5rem,6vw,5rem)] font-bold tracking-[-0.04em] leading-none text-accent">
                    {totalContributions.toLocaleString()}
                  </span>
                  <span className="block text-text-muted text-[0.9375rem] mt-2 font-medium">
                    contributions this year
                  </span>
                </div>

                <div className="activity-stat">
                  <span className="font-display text-[2.5rem] font-bold tracking-[-0.03em] leading-none">
                    {bestStreak}
                  </span>
                  <span className="block text-text-dim text-[0.8125rem] mt-1">
                    day{bestStreak !== 1 ? 's' : ''} — best streak
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-border">
                <p className="text-text-dim text-[0.8125rem] leading-[1.6]">
                  Each cell is a commit, a review, or an issue — visible proof of consistent, deliberate work in the open.
                </p>
              </div>
            </div>

            {/* Right — heatmap board */}
            <div className="bg-bg-elevated border border-border rounded-[20px] p-6 max-sm:p-4 flex flex-col">
              <div className="overflow-x-auto flex-1 flex flex-col">
                <div className="flex" style={{ minWidth: 680 }}>
                  <div className="flex flex-col justify-between mr-2" style={{ paddingTop: 18 }}>
                    {DAY_LABELS.map((label, i) => (
                      <span key={i} className="text-[0.55rem] text-text-dim leading-none font-medium" style={{ height: 'calc(100% / 7)' }}>
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className="relative h-[18px] mb-1">
                      {monthLabels.map((m, i) => (
                        <span
                          key={i}
                          className="absolute text-[0.6rem] text-text-dim font-medium"
                          style={{ left: `${(m.col / weeks.length) * 100}%` }}
                        >
                          {m.label}
                        </span>
                      ))}
                    </div>

                    <div
                      className="grid gap-[3px] flex-1"
                      style={{
                        gridTemplateColumns: `repeat(${weeks.length}, 1fr)`,
                        gridTemplateRows: 'repeat(7, 1fr)',
                      }}
                    >
                      {weeks.map((week) =>
                        week.map((day, dayIdx) => (
                          <HeatmapCell key={`${day.date}-${dayIdx}`} day={day} />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border text-[0.625rem] text-text-dim">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className="w-[11px] h-[11px] rounded-[2px]"
                    style={{ backgroundColor: LEVEL_COLORS[level] }}
                  />
                ))}
                <span>More</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
