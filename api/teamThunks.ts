import { AsyncThunkConfig } from "@/components/typings/api";
import { TeamDetails } from "@/components/typings/apiResponse";
import { createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "./apiCall";
import axiosInstance from "./axios";

export const getTeamDetails = createAsyncThunk<
  TeamDetails,
  string,
  AsyncThunkConfig
>("team/getTeamDetails", async (setId, thunkApi) => {
  const data = await apiCall(
    axiosInstance.get(`/i-one/sets/team/${setId}`),
    thunkApi,
  );
  return data[0];
});
