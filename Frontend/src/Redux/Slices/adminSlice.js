import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

// Configure axios to include credentials (for HTTP-only cookies)
axios.defaults.withCredentials = true;

const initialState = {
  isLoading: false,
  users: [],
  selectedUser: null,
  pagination: null,
  error: null,
  message: null,
};

export const getUsers = createAsyncThunk(
  "admin/getUsers",
  async (
    { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", role },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get(`${API_URL}/admin/getusers`, {
        params: { page, limit, sortBy, sortOrder, role },
      });
      return response.data.data; // { users, pagination }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getUserById = createAsyncThunk(
  "admin/getUserById",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/getUserById/${userId}`
      );
      return response.data.data; // user
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateUserRole = createAsyncThunk(
  "admin/updateUserRole",
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/admin/updateUserRole/${userId}`,
        { role }
      );
      return { user: response.data.data, message: response.data.message }; // { updatedUser, message }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const setSubscriptionPlan = createAsyncThunk(
  "admin/setSubscriptionPlan",
  async (subscriptionPlan, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/admin/setSubscriptionPlan`,
        subscriptionPlan
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Users
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      // Get User By ID
      .addCase(getUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      // Update User Role
      .addCase(updateUserRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
        // Update the user in the users list if it exists
        if (state.users) {
          const index = state.users.findIndex(
            (user) => user._id === action.payload.user._id
          );
          if (index !== -1) {
            state.users[index] = action.payload.user;
          }
        }
        // Update selectedUser if it matches
        if (
          state.selectedUser &&
          state.selectedUser._id === action.payload.user._id
        ) {
          state.selectedUser = action.payload.user;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      // Set Subscription Plan
      .addCase(setSubscriptionPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(setSubscriptionPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
      })
      .addCase(setSubscriptionPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      });
  },
});

export const { clearError, clearMessage } = adminSlice.actions;
export default adminSlice.reducer;
