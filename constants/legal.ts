import * as WebBrowser from "expo-web-browser";

// Terms and Privacy pages on the website (App Store review needs both to
// open a real page). Confirm these with Admin (AD-AR-01) before release.
export const TERMS_URL = "https://i-one-sports.com/terms";
export const PRIVACY_URL = "https://i-one-sports.com/privacy";

/** Opens a website page in the in-app browser. */
export const openWebPage = (url: string) =>
  WebBrowser.openBrowserAsync(url).catch(() => undefined);
