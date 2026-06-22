export type GroupRole = "admin" | "member";
export type MatchStatus = "scheduled" | "live" | "finished";

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserDTO;
}

export interface GroupDTO {
  id: string;
  name: string;
  inviteCode: string;
  createdById: string;
  createdAt: string;
  memberCount: number;
  myRole: GroupRole;
}

export interface GroupMemberDTO {
  userId: string;
  name: string;
  email: string;
  role: GroupRole;
  joinedAt: string;
}

export interface MatchDTO {
  id: string;
  externalId: number;
  homeTeam: string;
  awayTeam: string;
  kickoff: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  myPrediction: PredictionDTO | null;
}

export interface PredictionDTO {
  id: string;
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface MemberPredictionDTO {
  userId: string;
  name: string;
  prediction: { homeScore: number; awayScore: number } | null;
  visible: boolean;
}

export interface MatchHistoryDTO {
  id: string;
  externalId: number;
  homeTeam: string;
  awayTeam: string;
  kickoff: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  predictions: MemberPredictionDTO[];
}
