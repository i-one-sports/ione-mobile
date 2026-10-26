import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import authReducer from "./reducers/auth";
import languageReducer from "./reducers/language";
import matchDetailsReducer from "./reducers/matchDetails";
import ownerDashboardReducer from "./reducers/ownerDashboard";
import sessionReducer from "./reducers/sessions";
import walletReducer from "./reducers/wallet";
import tournamentReducer from "./reducers/tournaments";
import paymentReducer from "./reducers/payment";
import votesReducer from "./reducers/votes";
import matchesReducer from "./reducers/matches";
import refereesReducer from "./reducers/referees";
import recordingQueueReducer from "./reducers/recordingQueue";
import statsReducer from "./reducers/stats";
import badgesReducer from "./reducers/badges";

const authPersistConfig = {
  key: "main",
  storage: AsyncStorage,
};

const langPersistConfig = {
  key: "language",
  storage: AsyncStorage,
};

// Unsent referee taps must survive an app restart; only the queue is saved.
const recordingQueuePersistConfig = {
  key: "recordingQueue",
  storage: AsyncStorage,
  whitelist: ["queue"],
};

const persistedLangReducer = persistReducer(langPersistConfig, languageReducer);
const persistedRecordingQueueReducer = persistReducer(
  recordingQueuePersistConfig,
  recordingQueueReducer,
);
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

const reducers = combineReducers({
  language: persistedLangReducer,
  auth: persistedAuthReducer,
  sessions: sessionReducer,
  wallet: walletReducer,
  ownerDashboard: ownerDashboardReducer,
  matchDetails: matchDetailsReducer,
  tournament: tournamentReducer,
  payment: paymentReducer,
  votes: votesReducer,
  matches: matchesReducer,
  referees: refereesReducer,
  recordingQueue: persistedRecordingQueueReducer,
  stats: statsReducer,
  badges: badgesReducer,
});

const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
