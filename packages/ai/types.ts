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
