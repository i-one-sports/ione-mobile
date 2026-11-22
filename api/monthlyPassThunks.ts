import { createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "./apiCall";
import axiosInstance from "./axios";
import { withCheckoutRetry } from "./paymentThunks";
import { AsyncThunkConfig } from "@/components/typings/api";
import {
  MonthlyPass,
  MonthlyPassCheckoutResponse,
  MyMonthlyPassResponse,
} from "@/components/typings/apiResponse";

// GET /location/:locationId/monthly-pass/me — this pitch's pass price and the
// signed-in player's current + queued passes here.
export const getMyMonthlyPass = createAsyncThunk<
  MyMonthlyPassResponse,
  { locationId: string },
  AsyncThunkConfig
>("monthlyPass/me", async ({ locationId }, thunkAPI) => {
  return apiCall(
    axiosInstance.get(`/location/${locationId}/monthly-pass/me`),
    thunkAPI,
  );
});

// GET /user/monthly-passes — every pass the player has (active, queued,
// expired, pending, refunds), newest first, each with `pitch` filled in.
export const getUserMonthlyPasses = createAsyncThunk<
  MonthlyPass[],
  void,
  AsyncThunkConfig
>("monthlyPass/userPasses", async (_, thunkAPI) => {
  return apiCall(axiosInstance.get(`/user/monthly-passes`), thunkAPI);
});

// POST /location/:locationId/monthly-pass/checkout — opens (or returns the
// already-open) Paystack checkout. `holdSessionId` is buy-to-join: the spot
// in that session is held while the checkout is open. 409
// CHECKOUT_IN_PROGRESS is retried like session checkouts.
export const checkoutMonthlyPass = createAsyncThunk<
  MonthlyPassCheckoutResponse,
  { locationId: string; holdSessionId?: string },
  AsyncThunkConfig
>("monthlyPass/checkout", async ({ locationId, holdSessionId }, thunkAPI) => {
  const body = holdSessionId ? { holdSessionId } : undefined;
  return withCheckoutRetry(
    () =>
      axiosInstance.post(`/location/${locationId}/monthly-pass/checkout`, body),
    thunkAPI,
  );
});
