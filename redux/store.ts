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

const authPersistConfig = {
  key: "main",
  storage: AsyncStorage,
};

const langPersistConfig = {
  key: "language",
  storage: AsyncStorage,
};

const persistedLangReducer = persistReducer(langPersistConfig, languageReducer);
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

const reducers = combineReducers({
  language: persistedLangReducer,
  auth: persistedAuthReducer,
  sessions: sessionReducer,
  wallet: walletReducer,
  ownerDashboard: ownerDashboardReducer,
  matchDetails: matchDetailsReducer,
  tournament: tournamentReducer,
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
