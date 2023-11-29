// types.ts

export interface FrontEndRequestBody {
  type: 'text' | 'image' | 'audio';
  model?: string;
  messages?: Array<{
    role: string,
    content: string,
  }>;
  prompt?: string;
  n?: number;
  size?: string;
  file?: Buffer;
}

export type Dialog = {
  dialogType: 'send' | 'receive',
  model: string,
  length: number,
};

export type ModeType = 'text' | 'image' | 'stream' | 'audio' | 'speech';

export type Message = {
  content: string,
  role: string,
};

// 创建一个请求中应该被选取的属性类型
export type RequestPayloadProperties = {
  model: string,
  presence_penalty?: number, // 如果是可选属性则添加`?`
  frequency_penalty?: number,
  top_k?: number,
  top_p?: number,
  temperature?: number,
  max_tokens?: number,
};
