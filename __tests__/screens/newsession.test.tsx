import React from "react";
import { act, fireEvent, render, within } from "@testing-library/react-native";
import { Keyboard, Modal } from "react-native";
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

it("keeps the decider modal mounted through input blur and validation, then selects and reopens", async () => {
  jest
    .mocked(useFormik)
    .mockImplementation(jest.requireActual("formik").useFormik);
  const dismissKeyboard = jest
    .spyOn(Keyboard, "dismiss")
    .mockImplementation(() => {});
  const screen = render(<NewSession />);

  try {
    fireEvent.press(screen.getByText("Select decider"));
    expect(dismissKeyboard).toHaveBeenCalledTimes(1);
    const modalInstance = screen.UNSAFE_getByType(Modal).instance;
    expect(screen.getByText("Penalty Shootout")).toBeTruthy();

    // iOS blurs the input as the modal opens; Formik also validates asynchronously.
    await act(async () => {
      fireEvent(screen.getByLabelText("Minutes Per Set"), "blur", {
        nativeEvent: {},
        target: {},
      });
    });
    expect(screen.getByText("Minutes per set is required")).toBeTruthy();
    expect(screen.UNSAFE_getByType(Modal).instance).toBe(modalInstance);
    expect(screen.UNSAFE_getByType(Modal).props.visible).toBe(true);

    await act(async () => {
      fireEvent.press(screen.getByText("Golden Goal"));
    });
    expect(screen.UNSAFE_getByType(Modal).props.visible).toBe(false);
    expect(screen.getByText("Golden Goal")).toBeTruthy();

    fireEvent.press(screen.getByText("Golden Goal"));
    expect(
      within(screen.UNSAFE_getByType(Modal)).getByText("Golden Goal"),
    ).toHaveStyle({ fontWeight: "600" });
    expect(screen.UNSAFE_getByType(Modal).props.visible).toBe(true);
    expect(screen.UNSAFE_getByType(Modal).instance).toBe(modalInstance);

    fireEvent(screen.UNSAFE_getByType(Modal), "requestClose");
    expect(screen.UNSAFE_getByType(Modal).props.visible).toBe(false);
    expect(screen.getByText("Golden Goal")).toBeTruthy();
  } finally {
    dismissKeyboard.mockRestore();
  }
});
