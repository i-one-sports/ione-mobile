export function formatDate(dateString: string): string {
  if (!dateString) return "Not set";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

export function convertHeightToFeet(cm: number): string {
  if (!cm) return "Not set";
  const inches = cm * 0.393701;
  const feet = Math.floor(inches / 12);
  const remainingInches = Math.round(inches % 12);
  return `${feet}ft ${remainingInches}in`;
}

const POSITIONS: Record<string, string> = {
  GK: "Goalkeeper",
  DF: "Defender",
  MF: "Midfielder",
  FW: "Forward",
  ST: "Striker",
  CM: "Central Midfielder",
  CDM: "Defensive Midfielder",
  CAM: "Attacking Midfielder",
  LW: "Left Winger",
  RW: "Right Winger",
  CB: "Center Back",
  LB: "Left Back",
  RB: "Right Back",
};

export function getPositionName(positionCode: string): string {
  return POSITIONS[positionCode] || positionCode || "Not set";
}
