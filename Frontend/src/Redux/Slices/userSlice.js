import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

// Configure axios to include credentials (for HTTP-only cookies)
axios.defaults.withCredentials = true;

const initialState = {
  user: null,
  isLoading: false,
  error: null,
  message: null,
};

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/user/update-profile`,
        profileData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

export const updatePassword = createAsyncThunk(
  "user/updatePassword",
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/user/update-password`, {
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data || { message: error.message });
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserState: (state) => {
      state.error = null;
      state.message = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.message = "Profile updated successfully";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      // Update Password
      .addCase(updatePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.message = "Password updated successfully";
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      });
  },
});

export const { clearUserState } = userSlice.actions;

export default userSlice.reducer;
