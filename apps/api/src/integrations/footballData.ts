const BASE_URL = process.env.FOOTBALL_DATA_BASE_URL ?? "https://api.football-data.org/v4";
const API_KEY = process.env.FOOTBALL_DATA_API_KEY;

interface FootballDataMatch {
  id: number;
  utcDate: string;
  status: string; // "SCHEDULED" | "LIVE" | "IN_PLAY" | "PAUSED" | "FINISHED" | ...
  homeTeam: { name: string | null };
  awayTeam: { name: string | null };
  score: {
    fullTime: { home: number | null; away: number | null };
  };
}

interface FootballDataResponse {
  matches: FootballDataMatch[];
}

function mapStatus(status: string): "scheduled" | "live" | "finished" {
  if (status === "FINISHED") return "finished";
  if (status === "LIVE" || status === "IN_PLAY" || status === "PAUSED") return "live";
  return "scheduled";
}

export async function fetchWorldCupMatches(): Promise<
  Array<{
    externalId: number;
    homeTeam: string;
    awayTeam: string;
    kickoff: Date;
    status: "scheduled" | "live" | "finished";
    homeScore: number | null;
    awayScore: number | null;
  }>
> {
  if (!API_KEY) {
    throw new Error("FOOTBALL_DATA_API_KEY env var is required to sync matches");
  }

  const response = await fetch(`${BASE_URL}/competitions/WC/matches`, {
    headers: { "X-Auth-Token": API_KEY },
  });

  if (!response.ok) {
    throw new Error(`football-data.org request failed: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as FootballDataResponse;

  // Future knockout-stage fixtures (e.g. "Winner Match 73") have no team
  // names assigned yet — skip them until the bracket fills in.
  return data.matches
    .filter((m) => m.homeTeam.name && m.awayTeam.name)
    .map((m) => ({
      externalId: m.id,
      homeTeam: m.homeTeam.name as string,
      awayTeam: m.awayTeam.name as string,
      kickoff: new Date(m.utcDate),
      status: mapStatus(m.status),
      homeScore: m.score.fullTime.home,
      awayScore: m.score.fullTime.away,
    }));
}
