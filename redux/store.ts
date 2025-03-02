import { configureStore } from '@reduxjs/toolkit'
import loggedInUserSlice from './slices/loggedInUser'
import currentViewingUserSlice from './slices/currentViewingUser'
import currentMsgUserSlice from './slices/currentMsgUser'
import notificationSlice from './slices/notification'

export const store = configureStore({
  reducer: {
    loggedInUser: loggedInUserSlice,
    currentViewingUserId: currentViewingUserSlice,
    currentMsgUser: currentMsgUserSlice,
    notification: notificationSlice,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch