type PromptMessage = {
  role: "user" | "system";
  content: string;
};

// New function to create the content

export const createPromptMessage = (model, prompt): PromptMessage => {
  const isO1 = model === "o1-mini" || model === "o1-preview";
  const role = isO1 ? "user" : "system";
  return {
    role,
    content: prompt,
  };
};
