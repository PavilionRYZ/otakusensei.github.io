import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

//import reducers
// import userReducer from "./Slices/userSlice";
import authReducer from "./Slices/authSlice";
import comicReducer from "./Slices/comicSlice";
import subscriptionReducer from "./Slices/subscriptionSlice";
import paymentReducer from "./Slices/paymentSlice";

const rootReducer = combineReducers({
  // user: userReducer,
  auth: authReducer,
  comic: comicReducer,
  subscription: subscriptionReducer,
  payment: paymentReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export default store;
