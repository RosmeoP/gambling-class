import type { MatchDTO } from "@gambling-class/shared";
import { useState } from "react";
import { MatchCard } from "./MatchCard";
import { PredictionForm } from "./PredictionForm";

export function MatchEntry({ match, showWeekday }: { match: MatchDTO; showWeekday?: boolean }) {
  const kickoffPassed = new Date(match.kickoff) <= new Date();
  const [expanded, setExpanded] = useState(!kickoffPassed);

  return (
    <div className="space-y-3">
      <MatchCard
        match={match}
        expanded={expanded}
        onToggle={() => setExpanded((e) => !e)}
        showWeekday={showWeekday}
      />
      {expanded && <PredictionForm match={match} />}
    </div>
  );
}
