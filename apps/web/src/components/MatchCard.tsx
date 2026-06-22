import type { MatchDTO } from "@gambling-class/shared";
import { getFlagUrl } from "../lib/flags";

function TeamBadge({ name }: { name: string }) {
  const flagUrl = getFlagUrl(name);
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white shadow-inner ring-2 ring-white/20">
        {flagUrl ? (
          <img src={flagUrl} alt={`${name} flag`} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs font-bold text-gray-400">?</span>
        )}
      </span>
      <span className="text-center text-sm font-semibold text-white">{name}</span>
    </div>
  );
}

export function MatchCard({
  match,
  expanded,
  onToggle,
  showWeekday = false,
  showToggle = true,
}: {
  match: MatchDTO;
  expanded: boolean;
  onToggle: () => void;
  showWeekday?: boolean;
  showToggle?: boolean;
}) {
  const formattedDate = new Date(match.kickoff).toLocaleString(undefined, {
    weekday: showWeekday ? "short" : undefined,
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: showWeekday ? "short" : undefined,
  });

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black p-5 shadow-lg">
      <p className="text-center text-sm font-medium text-white/60">
        {formattedDate}
        {match.status === "live" && (
          <span className="ml-2 inline-flex items-center gap-1 text-red-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
            LIVE
          </span>
        )}
      </p>

      <div className="mt-4 flex items-center justify-between gap-2">
        <TeamBadge name={match.homeTeam} />

        <div className="flex h-12 w-12 shrink-0 items-center justify-center">
          {match.status === "scheduled" ? (
            <div className="flex h-10 w-10 rotate-45 items-center justify-center rounded-md border border-white/30 bg-black">
              <span className="-rotate-45 text-[10px] font-bold text-white/80">VS</span>
            </div>
          ) : (
            <span className="text-lg font-extrabold text-white">
              {match.homeScore} - {match.awayScore}
            </span>
          )}
        </div>

        <TeamBadge name={match.awayTeam} />
      </div>

      {showToggle && (
        <button
          onClick={onToggle}
          className="mt-5 w-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 text-center text-sm font-bold uppercase tracking-wide text-black transition hover:from-yellow-400 hover:to-orange-400"
        >
          {expanded ? "Hide details" : "View details"}
        </button>
      )}
    </div>
  );
}
