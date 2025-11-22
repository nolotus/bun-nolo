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
  // High priority: context from the user's current input for this request.
  currentInputContext?: string | null;

  // Medium-high priority: auto-selected or inferred relevant context.
  smartReadContext?: string | null;

  // Medium priority: references from past conversation messages.
  historyContext?: string | null;

  // Specific rules and processes for the bot/agent.
  botInstructionsContext?: string | null;

  // General knowledge base documents for lookup.
  botKnowledgeContext?: string | null;
}
