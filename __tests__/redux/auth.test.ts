import authReducer, {
  getUserDetails,
  logout,
  success,
} from "@/redux/reducers/auth";
import { getUser, login, register } from "@/api/authThunks";

const initialState = {
  user: {},
  profile: {},
  isRegistered: false,
  isAuthenticated: false,
  isVerified: false,
  isPhoneVerified: false,
  isAdmin: false,
};

describe("auth reducer", () => {
  it("returns the initial state", () => {
    expect(authReducer(undefined, { type: "@@INIT" })).toEqual(initialState);
  });

  it("getUserDetails merges into existing user", () => {
    const state = authReducer(
      { ...initialState, user: { _id: "123" } },
      getUserDetails({ firstName: "John" }),
    );
    expect(state.user).toEqual({ _id: "123", firstName: "John" });
  });

  it("logout resets everything to initial state", () => {
    const loggedIn = {
      ...initialState,
      user: { _id: "123", firstName: "John" },
      isAuthenticated: true,
      isVerified: true,
      isRegistered: true,
    };
    expect(authReducer(loggedIn, logout())).toEqual(initialState);
  });

  it("success sets isVerified to true", () => {
    const state = authReducer(initialState, success());
    expect(state.isVerified).toBe(true);
  });

  describe("getUser", () => {
    it("fulfilled sets user and isAuthenticated", () => {
      const user = { _id: "abc", firstName: "Jane", email: "jane@test.com" };
      const state = authReducer(initialState, {
        type: getUser.fulfilled.type,
        payload: user,
      });
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe("register", () => {
    it("fulfilled sets user and isRegistered", () => {
      const payload = { id: "abc", first_name: "Jane", email: "jane@test.com" };
      const state = authReducer(initialState, {
        type: register.fulfilled.type,
        payload,
      });
      expect(state.user).toEqual(payload);
      expect(state.isRegistered).toBe(true);
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("login", () => {
    it("pending clears isAuthenticated and isVerified", () => {
      const loggedIn = {
        ...initialState,
        isAuthenticated: true,
        isVerified: true,
      };
      const state = authReducer(loggedIn, { type: login.pending.type });
      expect(state.isAuthenticated).toBe(false);
      expect(state.isVerified).toBe(false);
    });

    it("fulfilled sets user, isAuthenticated, and isVerified", () => {
      const payload = {
        token: "tok_123",
        user: { id: "abc", firstName: "Jane" },
      };
      const state = authReducer(initialState, {
        type: login.fulfilled.type,
        payload,
      });
      expect(state.user).toEqual(payload.user);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isVerified).toBe(true);
    });
  });
});
