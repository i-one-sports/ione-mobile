// Mock native modules that aren't available in the test environment
// expo-secure-store and async-storage are mapped via moduleNameMapper in jest config

jest.mock("expo-font", () => ({
  useFonts: jest.fn().mockReturnValue([true, null]),
  loadAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn().mockReturnValue({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: jest.fn().mockReturnValue({}),
  Stack: { Screen: jest.fn() },
  router: { replace: jest.fn(), push: jest.fn() },
}));

jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));
