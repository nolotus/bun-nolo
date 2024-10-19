type PromptMessage = {
  role: "user" | "system";
  content: string;
};

// New function to create the content

export const createPromptMessage = (model, prompt): PromptMessage => {
  const role = model === "o1-mini" ? "user" : "system";
  return {
    role,
    content: prompt,
  };
};
