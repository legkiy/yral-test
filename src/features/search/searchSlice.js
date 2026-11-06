import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { searchBrands, searchOffers } from '../../api/partsApi.js';
import { extractBrands, normalizeOffers } from './normalize.js';

export const fetchBrands = createAsyncThunk(
  'search/brands',
  async (number, { signal }) => {
    return extractBrands(await searchBrands(number, signal));
  },
);

export const fetchOffers = createAsyncThunk(
  'search/offers',
  async ({ number, brand }, { signal }) => {
    return normalizeOffers(await searchOffers(number, brand, signal));
  },
);

const initialState = {
  article: '',
  selectedBrand: '',
  brands: [],
  offers: [],
  brandsStatus: 'idle',
  offersStatus: 'idle',
  brandsError: null,
  offersError: null,
  brandsRequestId: null,
  offersRequestId: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    articleChanged: (state, action) => {
      if (state.article === action.payload) return;
      return { ...initialState, article: action.payload };
    },
    brandSelected(state, action) {
      if (state.selectedBrand === action.payload) return;
      state.selectedBrand = action.payload;
      state.offers = [];
      state.offersStatus = 'idle';
      state.offersError = null;
      state.offersRequestId = null;
    },
  },
  extraReducers(builder) {
    for (const [thunk, prefix] of [
      [fetchBrands, 'brands'],
      [fetchOffers, 'offers'],
    ]) {
      builder
        .addCase(thunk.pending, (state, action) => {
          state[`${prefix}Status`] = 'loading';
          state[`${prefix}Error`] = null;
          state[`${prefix}RequestId`] = action.meta.requestId;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          if (state[`${prefix}RequestId`] !== action.meta.requestId) return;
          state[prefix] = action.payload;
          state[`${prefix}Status`] = 'succeeded';
          state[`${prefix}RequestId`] = null;
        })
        .addCase(thunk.rejected, (state, action) => {
          if (state[`${prefix}RequestId`] !== action.meta.requestId) return;
          state[`${prefix}RequestId`] = null;
          state[`${prefix}Status`] = action.meta.aborted ? 'idle' : 'failed';
          state[`${prefix}Error`] = action.meta.aborted
            ? null
            : action.error.message;
        });
    }
  },
});

export const { articleChanged, brandSelected } = searchSlice.actions;
export default searchSlice.reducer;
