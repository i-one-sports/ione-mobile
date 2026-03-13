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
import ownerDashboardReducer from "./reducers/ownerDashboard";
import sessionReducer from "./reducers/sessions";
import walletReducer from "./reducers/wallet";
import teamReducer from "./reducers/team";

const asyncPersistConfig = {
  key: "main",
  storage: AsyncStorage,
};

const persistedLangReducer = persistReducer(
  asyncPersistConfig,
  languageReducer,
);
const persistedAuthReducer = persistReducer(asyncPersistConfig, authReducer);

const reducers = combineReducers({
  language: persistedLangReducer,
  auth: persistedAuthReducer,
  sessions: sessionReducer,
  wallet: walletReducer,
  ownerDashboard: ownerDashboardReducer,
  team: teamReducer,
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
