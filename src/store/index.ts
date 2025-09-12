import {
    UnknownAction,
    combineReducers,
    configureStore,
} from "@reduxjs/toolkit";
import type { Reducer } from "redux";

import { restApi } from "api";

const appReducer = combineReducers({
  [restApi.reducerPath]: restApi.reducer,
});

const rootReducer: Reducer<ReturnType<typeof appReducer>, UnknownAction> = (
  state,
  action
) => {
  if (action.type === "LOGOUT") {
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

const setupStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(restApi.middleware),
  });

const store = setupStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];

export default store;
