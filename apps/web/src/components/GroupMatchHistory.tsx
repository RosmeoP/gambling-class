import type { MatchHistoryDTO } from "@gambling-class/shared";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { getFlagUrl } from "../lib/flags";

function isExactScore(
  prediction: { homeScore: number; awayScore: number } | null,
  homeScore: number | null,
  awayScore: number | null,
): boolean {
  if (!prediction || homeScore === null || awayScore === null) return false;
  return prediction.homeScore === homeScore && prediction.awayScore === awayScore;
}

function isCorrectOutcome(
  prediction: { homeScore: number; awayScore: number } | null,
  homeScore: number | null,
  awayScore: number | null,
): boolean {
  if (!prediction || homeScore === null || awayScore === null) return false;
  const actual = Math.sign(homeScore - awayScore);
  const predicted = Math.sign(prediction.homeScore - prediction.awayScore);
  return actual === predicted;
}

function TeamFlag({ team }: { team: string }) {
  const flagUrl = getFlagUrl(team);
  return (
    <div className="flex items-center gap-2">
      {flagUrl && <img src={flagUrl} alt={team} className="h-4 w-6 rounded-sm object-cover" />}
      <span className="text-sm font-medium text-gray-900">{team}</span>
    </div>
  );
}

function MatchHistoryCard({ match }: { match: MatchHistoryDTO }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TeamFlag team={match.homeTeam} />
          <span className="text-lg font-bold text-gray-900">
            {match.homeScore} - {match.awayScore}
          </span>
          <TeamFlag team={match.awayTeam} />
        </div>
        <span className="text-xs uppercase text-gray-400">{new Date(match.kickoff).toLocaleDateString()}</span>
      </div>

      <ul className="space-y-1">
        {match.predictions.map((p) => {
          const exact = isExactScore(p.prediction, match.homeScore, match.awayScore);
          const correctOutcome = !exact && isCorrectOutcome(p.prediction, match.homeScore, match.awayScore);
          return (
            <li key={p.userId} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{p.name}</span>
              <span className="flex items-center gap-2">
                {p.prediction ? (
                  <span className="font-medium text-gray-900">
                    {p.prediction.homeScore} - {p.prediction.awayScore}
                  </span>
                ) : (
                  <span className="text-gray-400">No prediction</span>
                )}
                {exact && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    Exact
                  </span>
                )}
                {correctOutcome && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    Outcome
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function GroupMatchHistory({ groupId }: { groupId: string }) {
  const { data: matches, isLoading } = useQuery({
    queryKey: ["group-history", groupId],
    queryFn: () => apiFetch<MatchHistoryDTO[]>(`/groups/${groupId}/history`),
  });

  if (isLoading) return <p className="text-gray-500">Loading history...</p>;
  if (!matches || matches.length === 0) {
    return <p className="text-gray-500">No finished matches yet.</p>;
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <MatchHistoryCard key={match.id} match={match} />
      ))}
    </div>
  );
}
