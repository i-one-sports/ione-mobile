// Shapes of the /badges endpoints. Each badge is unlocked once ever and is
// private to the player until they share it.

export type BadgeType = "LICENCE_TO_MISS";

export interface Badge {
  _id: string;
  user: string;
  badge: BadgeType;
  unlockedAt: string;
  /** The sessions that earned it, newest first. Only returned to the owner. */
  sessions?: string[];
  /** null until the unlock pop-up has been shown. Owner only. */
  seenAt?: string | null;
  /** Visible on the player's public profile. */
  shared: boolean;
}
