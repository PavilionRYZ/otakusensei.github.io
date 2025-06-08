import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

// Configure axios to include credentials (for HTTP-only cookies)
axios.defaults.withCredentials = true;

const initialState = {
  paymentStatus: null,
  paymentId: null,
  clientSecret: null,
  isLoading: false,
  error: null,
  message: null,
};

export const initiatePayment = createAsyncThunk(
  "payment/initiatePayment",
  async ({ planType }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/initiate-payment`, {
        planType,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Thunk to verify a payment
export const verifyPayment = createAsyncThunk(
  "payment/verifyPayment",
  async ({ paymentId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/verify-payment`, {
        paymentId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearPaymentState: (state) => {
      state.paymentStatus = null;
      state.paymentId = null;
      state.clientSecret = null;
      state.isLoading = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initiate Payment
      .addCase(initiatePayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
        state.paymentStatus = null;
        state.paymentId = null;
        state.clientSecret = null;
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentStatus = "pending";
        state.paymentId = action.payload.paymentId;
        state.clientSecret = action.payload.clientSecret;
        state.message = action.payload.message;
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentStatus = "success";
        state.message = action.payload.message;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.paymentStatus = "failed";
        state.error = action.payload.message;
      });
  },
});

export const { clearPaymentState } = paymentSlice.actions;

export default paymentSlice.reducer;
