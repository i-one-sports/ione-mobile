// Prices are stored and sent to the API in kobo (₦1 = 100 kobo), the unit
// Paystack expects. Owners type and players see naira.

export const nairaToKobo = (naira: number) => Math.round(naira * 100);

export const koboToNaira = (kobo: number) => kobo / 100;

export const formatKoboAsNaira = (kobo?: number | null) =>
  `₦${koboToNaira(Number(kobo ?? 0)).toLocaleString()}`;
