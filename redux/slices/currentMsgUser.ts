import { createSlice } from "@reduxjs/toolkit";

const currentMsgUserSlice = createSlice({
  name: 'currentMsgUser',
  initialState: {
    $id: null,
    isFlag: false
  },
  reducers: {
    setCurrentMsgUser(state, action) {
      state.$id = action.payload.$id,
        state.isFlag = action.payload.isFlag
    }
  }
})


export const { setCurrentMsgUser } = currentMsgUserSlice.actions;
export default currentMsgUserSlice.reducer;

