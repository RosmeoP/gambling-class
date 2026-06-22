import type { MatchDTO } from "@gambling-class/shared";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
  });

  const [allExpanded, setAllExpanded] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const dayGroups = matches ? groupByDay(matches) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Upcoming matches</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">
            {allExpanded ? "Showing details" : "Hiding details"}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={allExpanded}
            onClick={() => {
              setAllExpanded((value) => !value);
              setOverrides({});
            }}
            className={`relative h-7 w-14 rounded-full transition-colors ${
              allExpanded ? "bg-emerald-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                allExpanded ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

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
              {group.matches.map((match) => (
                <MatchEntry
                  key={match.id}
                  match={match}
                  expanded={overrides[match.id] ?? allExpanded}
                  onToggle={() =>
                    setOverrides((prev) => ({
                      ...prev,
                      [match.id]: !(prev[match.id] ?? allExpanded),
                    }))
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
