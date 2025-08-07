import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;
axios.defaults.withCredentials = true;

const initialState = {
  plans: [],
  isLoading: false,
  error: null,
  message: null,
  premiumUsers: 0,
};

export const getSubscriptionPlans = createAsyncThunk(
  "subscription/getSubscriptionPlans",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/get-subscription-plans`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Fetch failed" }
      );
    }
  }
);

export const setSubscriptionPlan = createAsyncThunk(
  "subscription/setSubscriptionPlan",
  async ({ planType, price, durationDays }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/update-subscription`, {
        planType,
        price,
        durationDays,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Update failed" }
      );
    }
  }
);

export const getPremiumUsersCount = createAsyncThunk(
  "subscription/getPremiumUsersCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/user-subscription`);
      return response.data.data; // Should be a number
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to fetch premium user count",
        }
      );
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
        state.error = action.payload?.message || "Fetch failed";
      })

      .addCase(setSubscriptionPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(setSubscriptionPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
        const updatedPlan = action.payload.data;
        const idx = state.plans.findIndex(
          (p) => p.planType === updatedPlan.planType
        );
        if (idx > -1) {
          state.plans[idx] = updatedPlan;
        } else {
          state.plans.push(updatedPlan);
        }
      })
      .addCase(setSubscriptionPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Update failed";
      })

      .addCase(getPremiumUsersCount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPremiumUsersCount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.premiumUsers = action.payload;
      })
      .addCase(getPremiumUsersCount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Get count failed";
      });
  },
});
export const { clearSubscriptionState } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
