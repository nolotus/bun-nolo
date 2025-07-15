// types.ts

export type ModeType =
  | "text"
  | "image"
  | "stream"
  | "audio"
  | "speech"
  | "surf"
  | "vision";

export interface PromptFormData {
  name: string;
  content: string;
  category?: string;
  tags?: string[];
}

export interface Contexts {
  currentUserContext?: string | null;
  smartReadContext?: string | null;
  historyContext?: string | null;
  botInstructionsContext?: string | null;
  botKnowledgeContext?: string | null;
}
