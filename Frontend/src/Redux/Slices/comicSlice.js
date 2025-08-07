import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

axios.defaults.withCredentials = true;

const initialState = {
  comics: [],
  selectedComic: null,
  pagination: null,
  isLoading: false,
  error: null,
  likeStatus: {},
};

export const fetchComics = createAsyncThunk(
  "comic/fetchComics",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        genres,
        premium,
        minRating,
        createdAfter,
        minLikes,
        exactMatch,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = filters;

      const response = await axios.get(`${API_URL}/comics`, {
        params: {
          page,
          limit,
          search,
          genres,
          premium,
          minRating,
          createdAfter,
          minLikes,
          exactMatch,
          sortBy,
          sortOrder,
        },
      });
      return {
        comics: response.data.data.comics || [],
        pagination: response.data.data.pagination || null,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch comics"
      );
    }
  }
);

export const fetchComicById = createAsyncThunk(
  "comic/fetchComicById",
  async ({ id, populate = [] }, { rejectWithValue, getState }) => {
    try {
      const response = await axios.get(`${API_URL}/comic/${id}`, {
        params: { populate: populate.join(",") },
      });
      const comic = response.data.data;
      const userId = getState().auth.user?._id;

      const hasLiked =
        userId && comic.likes
          ? comic.likes.some(
              (like) => like._id.toString() === userId.toString()
            )
          : false;

      return {
        comic,
        hasLiked,
        likesCount: comic.likesCount || (comic.likes ? comic.likes.length : 0),
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch comic"
      );
    }
  }
);

export const likeComicById = createAsyncThunk(
  "comic/likeComicById",
  async (comicId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/comic/like/${comicId}`);
      return {
        comicId,
        likesCount: response.data.data.likesCount,
        hasLiked: response.data.data.hasLiked,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle like"
      );
    }
  }
);

export const submitReview = createAsyncThunk(
  "comic/submitReview",
  async ({ comicId, rating, comment }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/review/create/${comicId}`, {
        rating,
        comment,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit review"
      );
    }
  }
);

export const deleteComic = createAsyncThunk(
  "comic/deleteComic",
  async (comicId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/comic/delete/${comicId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete comic"
      );
    }
  }
);

export const editComic = createAsyncThunk(
  "comic/editComic",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/comic/edit/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to edit comic"
      );
    }
  }
);

export const addComic = createAsyncThunk(
  "comic/addComic",
  async (comicData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/comic/add`, comicData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add comic"
      );
    }
  }
);

const comicSlice = createSlice({
  name: "comic",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedComic: (state) => {
      state.selectedComic = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comics = action.payload.comics;
        state.pagination = action.payload.pagination;
        action.payload.comics.forEach((comic) => {
          state.likeStatus[comic._id] = {
            ...state.likeStatus[comic._id],
            hasLiked: false,
            likesCount: comic.likesCount || 0,
          };
        });
      })
      .addCase(fetchComics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchComicById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComicById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedComic = action.payload.comic;
        state.likeStatus[action.payload.comic._id] = {
          hasLiked: action.payload.hasLiked,
          likesCount: action.payload.likesCount,
        };
      })
      .addCase(fetchComicById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(likeComicById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(likeComicById.fulfilled, (state, action) => {
        state.isLoading = false;
        const { comicId, likesCount, hasLiked } = action.payload;
        state.likeStatus[comicId] = { hasLiked, likesCount };
        const comicIndex = state.comics.findIndex(
          (comic) => comic._id === comicId
        );
        if (comicIndex !== -1) {
          state.comics[comicIndex].likesCount = likesCount;
        }
        if (state.selectedComic && state.selectedComic._id === comicId) {
          state.selectedComic.likesCount = likesCount;
        }
      })
      .addCase(likeComicById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(submitReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedComic = action.payload; // Update comic with new review
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteComic.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteComic.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comics = state.comics.filter(
          (comic) => comic._id !== action.payload._id
        );
      })
      .addCase(deleteComic.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(editComic.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(editComic.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comics = state.comics.map((comic) =>
          comic._id === action.payload._id ? action.payload : comic
        );
      })
      .addCase(editComic.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addComic.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addComic.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comics.push(action.payload);
      })
      .addCase(addComic.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedComic } = comicSlice.actions;
export default comicSlice.reducer;
