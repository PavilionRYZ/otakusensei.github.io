import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

// Configure axios to include credentials (for HTTP-only cookies)
axios.defaults.withCredentials = true;

const initialState = {
  plans: [], // Array of subscription plans
  isLoading: false,
  error: null,
  message: null,
};

// Thunk to fetch subscription plans
export const getSubscriptionPlans = createAsyncThunk(
  "subscription/getSubscriptionPlans",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/get-subscription-plans`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    clearSubscriptionState: (state) => {
      state.isLoading = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Subscription Plans
      .addCase(getSubscriptionPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getSubscriptionPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = action.payload.data;
        state.message = action.payload.message;
      })
      .addCase(getSubscriptionPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      });
  },
});

export const { clearSubscriptionState } = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
