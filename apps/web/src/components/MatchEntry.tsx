import type { MatchDTO } from "@gambling-class/shared";
import { useState } from "react";
import { MatchCard } from "./MatchCard";
import { PredictionForm } from "./PredictionForm";

export function MatchEntry({
  match,
  showWeekday,
  expanded: controlledExpanded,
  onToggle: controlledOnToggle,
}: {
  match: MatchDTO;
  showWeekday?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const kickoffPassed = new Date(match.kickoff) <= new Date();
  const [internalExpanded, setInternalExpanded] = useState(!kickoffPassed);

  const expanded = controlledExpanded ?? internalExpanded;
  const onToggle = controlledOnToggle ?? (() => setInternalExpanded((e) => !e));

  return (
    <div className="space-y-3">
      <MatchCard match={match} expanded={expanded} onToggle={onToggle} showWeekday={showWeekday} />
      {expanded && <PredictionForm match={match} />}
    </div>
  );
}
