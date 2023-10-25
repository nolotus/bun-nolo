import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Message {
  role: string
  content: string
  image?: string
}

type ChatSliceState = {
  messages: Message[],
  allowSend: boolean,
  tempMessage: Message
  
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    allowSend: true,
    tempMessage: {
      id: Date.now(),
      role: 'user',
      content: ''
    }
  },
  reducers: {
    sendMessage: (state: ChatSliceState, action: PayloadAction<Message>) => {
      // 发送消息
      state.messages.push(action.payload)
    },
    receiveMessage: (state: ChatSliceState, action: PayloadAction<Message>) => {
      // 添加对方回复的消息
      state.messages.push(action.payload)
    },
    clearMessages: (state: ChatSliceState) => {
      // 清除消息
      state.messages = []
    }
  }
})

export const { sendMessage,receiveMessage ,clearMessages } = chatSlice.actions

export default chatSlice.reducer
