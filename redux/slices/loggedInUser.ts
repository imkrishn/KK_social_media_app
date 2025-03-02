import { createSlice } from "@reduxjs/toolkit";




interface User {
  $id: string;
  fullName: string;
  userName: string;
  imageURL?: string;
  dob: string;
  email: string
}

const initialState: User = {
  $id: '',
  fullName: '',
  userName: '',
  imageURL: '',
  email: '',
  dob: ''
}

const loggedInUserSlice = createSlice({
  name: 'loggedInUser',
  initialState,
  reducers: {
    setLoggedInUser(state, action) {
      state.$id = action.payload.$id;
      state.dob = action.payload.dob;
      state.email = action.payload.email;
      state.fullName = action.payload.fullName;
      state.imageURL = action.payload.imageURL;
      state.userName = action.payload.userName;
    }
  }
})

export const { setLoggedInUser } = loggedInUserSlice.actions;
export default loggedInUserSlice.reducer;