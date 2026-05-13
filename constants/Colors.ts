/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#00FF94";
const tintColorDark = "#00FF94";

export const Colors = {
  light: {
    text: "#404040",
    background: "#fff",
    tint: tintColorLight,
    icon: "#000",
    tabIconDefault: "#6C757D",
    tabIconTextSelected: "green",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#F5FFF2BA",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#a6a59bff",
    tabIconTextSelected: "gray",
    tabIconSelected: tintColorDark,
  },
};
