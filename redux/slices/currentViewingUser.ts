import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  $id: string;
}

const initialState: User = {
  $id: '',
};

const currentViewingUserSlice = createSlice({
  name: 'currentViewingUserId',
  initialState,
  reducers: {
    setCurrentViewingUserId(state, action: PayloadAction<{ $id: string }>) {
      state.$id = action.payload.$id;
    }
  }
});

export const { setCurrentViewingUserId } = currentViewingUserSlice.actions;
export default currentViewingUserSlice.reducer;
