import type { MatchDTO } from "@gambling-class/shared";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { MatchEntry } from "../components/MatchEntry";

function groupByDay(matches: MatchDTO[]): { dayKey: string; label: string; matches: MatchDTO[] }[] {
  const groups = new Map<string, MatchDTO[]>();

  for (const match of matches) {
    const date = new Date(match.kickoff);
    const dayKey = date.toDateString();
    const existing = groups.get(dayKey);
    if (existing) {
      existing.push(match);
    } else {
      groups.set(dayKey, [match]);
    }
  }

  return Array.from(groups.entries()).map(([dayKey, dayMatches]) => ({
    dayKey,
    label: new Date(dayMatches[0].kickoff).toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    }),
    matches: dayMatches,
  }));
}

export function Upcoming() {
  const { data: matches, isLoading } = useQuery({
    queryKey: ["matches", "upcoming"],
    queryFn: () => apiFetch<MatchDTO[]>("/matches/upcoming"),
    refetchInterval: 60 * 1000,
  });

  const dayGroups = matches ? groupByDay(matches) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Upcoming matches</h1>

      {isLoading && <p className="text-gray-500">Loading...</p>}
      {!isLoading && matches?.length === 0 && (
        <p className="text-gray-500">No upcoming matches scheduled in the next 3 days.</p>
      )}
      <div className="space-y-10">
        {dayGroups.map((group) => (
          <div key={group.dayKey}>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="whitespace-nowrap text-lg font-bold text-gray-900">{group.label}</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent" />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {group.matches.map((match, index) => (
                <div
                  key={match.id}
                  className={`animate-liquid-entrance delay-${Math.min(index, 9)}`}
                >
                  <MatchEntry match={match} readOnly />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
