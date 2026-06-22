import type { MatchDTO } from "@gambling-class/shared";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { MatchEntry } from "../components/MatchEntry";

export function Dashboard() {
  const { data: matches, isLoading } = useQuery({
    queryKey: ["matches", "today"],
    queryFn: () => apiFetch<MatchDTO[]>("/matches/today"),
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Today's matches</h1>
      {isLoading && <p className="text-gray-500">Loading...</p>}
      {!isLoading && matches?.length === 0 && (
        <p className="text-gray-500">No matches scheduled today.</p>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {matches?.map((match) => (
          <MatchEntry key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}
