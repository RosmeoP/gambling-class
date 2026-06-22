import type { MatchDTO } from "@gambling-class/shared";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { MatchEntry } from "../components/MatchEntry";

export function Upcoming() {
  const { data: matches, isLoading } = useQuery({
    queryKey: ["matches", "upcoming"],
    queryFn: () => apiFetch<MatchDTO[]>("/matches/upcoming"),
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Upcoming matches</h1>
      {isLoading && <p className="text-gray-500">Loading...</p>}
      {!isLoading && matches?.length === 0 && (
        <p className="text-gray-500">No upcoming matches scheduled.</p>
      )}
      <div className="space-y-6">
        {matches?.map((match) => (
          <MatchEntry key={match.id} match={match} showWeekday />
        ))}
      </div>
    </div>
  );
}
