export const isResponseAPIModel = (agentConfig) => {
  return agentConfig.provider === "openai" && agentConfig.model === "o3-pro";
};
