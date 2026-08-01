import authReducer, {
  getUserDetails,
  logout,
  success,
} from "@/redux/reducers/auth";
import { getUser, login, register, updateProfile } from "@/api/authThunks";

const initialState = {
  user: null,
  profile: null,
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
    const state = authReducer(loggedIn, logout());
    expect(state.user).toEqual(null);
    expect(state.profile).toEqual(null);
    expect(state.isAuthenticated).toBe(false);
    expect(state.isVerified).toBe(false);
    expect(state.isRegistered).toBe(true);
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

  describe("updateProfile", () => {
    it("fulfilled merges the updated user data into state", () => {
      const state = authReducer(initialState, {
        type: updateProfile.fulfilled.type,
        payload: {
          firstName: "Ada",
          lastName: "Lovelace",
          email: "ada@test.com",
        },
      });

      expect(state.user).toEqual({
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@test.com",
      });
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
