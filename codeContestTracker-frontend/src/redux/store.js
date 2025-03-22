import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authslice";

const store = configureStore({
  reducer: {
    auth: authReducer, // Authentication state
  },
});

export default store;
