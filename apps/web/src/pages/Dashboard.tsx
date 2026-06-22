import type { MatchDTO } from "@gambling-class/shared";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "../lib/api";
import { MatchEntry } from "../components/MatchEntry";

export function Dashboard() {
  const { data: matches, isLoading } = useQuery({
    queryKey: ["matches", "today"],
    queryFn: () => apiFetch<MatchDTO[]>("/matches/today"),
    refetchInterval: 60 * 1000,
  });

  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const allExpanded = matches && matches.length > 0 && matches.every((m) => expandedIds[m.id]);

  const toggleAll = () => {
    if (!matches) return;
    if (allExpanded) {
      setExpandedIds({});
    } else {
      const newMap: Record<string, boolean> = {};
      matches.forEach((m) => {
        newMap[m.id] = true;
      });
      setExpandedIds(newMap);
    }
  };

  const handleToggle = (matchId: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [matchId]: !prev[matchId],
    }));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Today's matches</h1>
        {!isLoading && matches && matches.length > 0 && (
          <button
            onClick={toggleAll}
            className="rounded-full border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-neutral-800 dark:text-white shadow-sm transition hover:bg-neutral-50 dark:hover:bg-white/15 active:scale-[0.98]"
          >
            {allExpanded ? "Collapse all details" : "Expand all details"}
          </button>
        )}
      </div>

      {isLoading && <p className="text-gray-500">Loading...</p>}
      {!isLoading && matches?.length === 0 && (
        <p className="text-gray-500">No matches scheduled today.</p>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {matches?.map((match, index) => (
          <div
            key={match.id}
            className={`animate-liquid-entrance delay-${Math.min(index, 9)}`}
          >
            <MatchEntry
              match={match}
              expanded={Boolean(expandedIds[match.id])}
              onToggle={() => handleToggle(match.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
