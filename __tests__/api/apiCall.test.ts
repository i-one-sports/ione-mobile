import apiCall from "@/api/apiCall";
import * as SecureStore from "expo-secure-store";

const mockRejectWithValue = jest.fn((val) => ({ payload: val }));
const thunkAPI = { rejectWithValue: mockRejectWithValue };

const makeResponse = (data: object) => Promise.resolve({ data }) as any;

const makeError = (status: number, data: object) => {
  const err: any = new Error("Request failed");
  err.response = { status, data };
  return Promise.reject(err);
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("apiCall", () => {
  it("returns data on success", async () => {
    const result = await apiCall(makeResponse({ message: "ok" }), thunkAPI);
    expect(result).toEqual({ message: "ok" });
  });

  it("stores token in SecureStore when route is auth and token is present", async () => {
    await apiCall(
      makeResponse({ token: "tok_abc", user: null }),
      thunkAPI,
      "auth",
    );
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("i-one", "tok_abc");
  });

  it("stores user in SecureStore when route is auth and user is present", async () => {
    const user = { _id: "123", firstName: "John" };
    await apiCall(makeResponse({ token: "tok_abc", user }), thunkAPI, "auth");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "user-data",
      JSON.stringify(user),
    );
  });

  it("does NOT call SecureStore when route is not auth", async () => {
    await apiCall(makeResponse({ data: "something" }), thunkAPI);
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it("rejects with network error when there is no response", async () => {
    const err: any = new Error("Network Error");
    await apiCall(Promise.reject(err), thunkAPI);
    expect(mockRejectWithValue).toHaveBeenCalledWith({
      msg: "Network Error",
      status: 500,
    });
  });

  it("rejects with server error message on 500", async () => {
    await apiCall(makeError(500, { error: "Internal Server Error" }), thunkAPI);
    expect(mockRejectWithValue).toHaveBeenCalledWith({
      msg: "Server Error",
      status: 500,
    });
  });

  it("rejects with API error message on 4xx", async () => {
    await apiCall(makeError(422, { error: "Validation failed" }), thunkAPI);
    expect(mockRejectWithValue).toHaveBeenCalledWith({
      msg: "Validation failed",
      status: 422,
    });
  });

  it("falls back to the full response data if no error key on 4xx", async () => {
    await apiCall(makeError(404, { message: "not found" }), thunkAPI);
    expect(mockRejectWithValue).toHaveBeenCalledWith(
      expect.objectContaining({ status: 404 }),
    );
  });
});
