import { configureStore } from '@reduxjs/toolkit'
import  counterReducer from 'chat/chatSlice'
import userReducer from 'user/userSlice'


  const store = configureStore({
    reducer: {
      counter: counterReducer,
      user:userReducer
    }
  })
  export type RootState = ReturnType<typeof store.getState>
  export type AppDispatch = typeof store.dispatch
export default store
