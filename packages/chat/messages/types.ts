export interface Message {
  role: MessageRole;
  content: string;
  image?: string;
  id: string;
  images?: string[]; // Ollama format
  dbKey: string; // Database key for the message
  cybotId?: string; // ID of the AI bot
  cybotKey?: string; // Key of the AI bot
  isStreaming?: boolean; // Flag for streaming responses
}

type MessageRole = "user" | "system" | "assistant";

// OpenAI specific types
type OpenAIImageUrl =
  | `http${string}`
  | `https${string}`
  | `data:image/${string};base64,${string}`;

interface OpenAIImageContent {
  type: "image_url";
  image_url: {
    url: OpenAIImageUrl;
  };
}

interface OpenAITextContent {
  type: "text";
  text: string;
}

type OpenAIContent = OpenAITextContent | OpenAIImageContent;

// Claude specific types
interface ClaudeImageSource {
  type: "base64";
  media_type: string;
  data: string;
}

interface ClaudeImageContent {
  type: "image";
  source: ClaudeImageSource;
}

interface ClaudeTextContent {
  type: "text";
  text: string;
}

type ClaudeContent = ClaudeTextContent | ClaudeImageContent;

// Combined content type
type MessageContent = OpenAIContent | ClaudeContent;

export type Content = string | MessageContent[];
