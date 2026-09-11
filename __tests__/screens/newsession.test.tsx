import React from "react";
import { act, render } from "@testing-library/react-native";
import { useFormik } from "formik";
import { router, useLocalSearchParams } from "expo-router";
import { createSession, startSession } from "@/api/sessions";
import NewSession from "@/app/screens/newsession";

jest.mock("formik", () => ({ useFormik: jest.fn() }));
jest.mock("@/api/sessions", () => ({
  startSession: jest.fn(),
  createSession: jest.fn(),
}));
jest.mock("@/redux/store", () => ({
  useAppDispatch: () => (action: unknown) => action,
}));
jest.mock("react-native-toast-message", () => ({ show: jest.fn() }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
jest.mock(
  "@/components/SafeAreaScreen",
  () => jest.requireActual("react-native").View,
);
jest.mock("@/components/ThemedText", () => ({
  ThemedText: jest.requireActual("react-native").Text,
}));
jest.mock(
  "@/components/ui/SectionCard",
  () => jest.requireActual("react-native").View,
);
jest.mock("@/components/InputField", () => () => null);
jest.mock("@/components/TimePickerField", () => () => null);
jest.mock("@/components/SessionPitchPicker", () => () => null);
jest.mock("@/components/loader", () => () => null);

const values = {
  startTime: "2026-09-10T15:00:00.000Z",
  timeDuration: "120",
  playersPerTeam: "5",
  setNumber: "3",
  winningDecider: "PENALTY",
  minsPerSet: "10",
};
let submit: (submittedValues: typeof values) => Promise<void>;
const startMock = startSession as unknown as jest.Mock;
const createMock = createSession as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(useLocalSearchParams)
    .mockReturnValue({ pitchId: "pitch-1", pitchName: "Lekki Pitch" });
  jest.mocked(useFormik).mockImplementation(((config: any) => {
    submit = config.onSubmit;
    return {
      values: config.initialValues,
      errors: {},
      touched: {},
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
      handleSubmit: jest.fn(),
      setFieldValue: jest.fn(),
    };
  }) as unknown as typeof useFormik);
  startMock.mockReturnValue({
    unwrap: () => Promise.resolve({ _id: "session-1" }),
  });
  createMock.mockReturnValue({
    unwrap: () => Promise.resolve({ _id: "session-1" }),
  });
});

it("starts a session with the registered pitch ID only when the form is submitted", async () => {
  render(<NewSession />);
  expect(startMock).not.toHaveBeenCalled();
  await act(async () => {
    await submit(values);
  });
  expect(startMock).toHaveBeenCalledWith({ locationId: "pitch-1" });
  expect(createMock).toHaveBeenCalledWith({
    sessionId: "session-1",
    data: {
      ...values,
      timeDuration: 120,
      playersPerTeam: 5,
      setNumber: 3,
      minsPerSet: 10,
    },
  });
  expect(router.replace).toHaveBeenCalledWith({
    pathname: "/joinsession",
    params: { sessionId: "session-1" },
  });
});

it("requires a pitch before calling either session endpoint", async () => {
  jest.mocked(useLocalSearchParams).mockReturnValue({});
  const screen = render(<NewSession />);
  await act(async () => {
    await submit(values);
  });
  expect(
    screen.getByText("Choose a pitch before creating your session."),
  ).toBeTruthy();
  expect(startMock).not.toHaveBeenCalled();
  expect(createMock).not.toHaveBeenCalled();
});

it("reuses the started session after a failed completion", async () => {
  createMock.mockReturnValueOnce({
    unwrap: () => Promise.reject({ msg: "Try again" }),
  });
  render(<NewSession />);
  await act(async () => {
    await submit(values);
  });
  await act(async () => {
    await submit(values);
  });
  expect(startMock).toHaveBeenCalledTimes(1);
  expect(createMock).toHaveBeenCalledTimes(2);
  expect(createMock.mock.calls[1][0].sessionId).toBe("session-1");
});

it("supports older links that already carry a session ID", async () => {
  jest
    .mocked(useLocalSearchParams)
    .mockReturnValue({ locationId: "existing-session" });
  render(<NewSession />);
  await act(async () => {
    await submit(values);
  });
  expect(startMock).not.toHaveBeenCalled();
  expect(createMock.mock.calls[0][0].sessionId).toBe("existing-session");
});
