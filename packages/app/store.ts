import { configureStore } from '@reduxjs/toolkit'
import  counterReducer from 'chat/chatSlice'
import userReducer from 'user/userSlice'
// import { setupListeners } from '@reduxjs/toolkit/query'
import { pokemonApi } from './services/pokemon'

  const store = configureStore({
    reducer: {
      chat: counterReducer,
      user:userReducer,
      [pokemonApi.reducerPath]: pokemonApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(pokemonApi.middleware),
  })
  export type RootState = ReturnType<typeof store.getState>
  export type AppDispatch = typeof store.dispatch
export default store
