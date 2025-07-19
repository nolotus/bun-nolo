export const isResponseAPIModel = (agentConfig) => {
  return (
    agentConfig.provider === "openai" &&
    (agentConfig.model === "o3-pro" ||
      agentConfig.model === "o4-mini" ||
      agentConfig.model === "gpt-4.1-mini")
  );
};
