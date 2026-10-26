import { VoteCandidateUser } from "@/components/typings/vote";

const POSITIONS: Record<string, string> = {
  GK: "Goalkeeper",
  DF: "Defender",
  MF: "Midfielder",
  ST: "Forward",
  FW: "Forward",
};

export const positionLabel = (code?: string) =>
  code ? (POSITIONS[code] ?? code) : "";

export const candidateName = (user?: VoteCandidateUser) =>
  user ? `${user.firstName} ${user.lastName ?? ""}`.trim() : "Player";

export const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** 1:42:10 */
export const formatClock = (ms: number) => {
  const total = Math.floor(Math.max(ms, 0) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${Math.floor(total / 3600)}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
};

/** 1h 41m */
export const formatShort = (ms: number) => {
  const minutes = Math.ceil(Math.max(ms, 0) / 60000);
  const h = Math.floor(minutes / 60);
  return h > 0 ? `${h}h ${minutes % 60}m` : `${minutes}m`;
};
