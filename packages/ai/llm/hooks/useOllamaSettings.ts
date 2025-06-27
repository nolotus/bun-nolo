import { useState, useEffect } from "react";

export const useOllamaSettings = (
  provider: string,
  setValue: (field: string, value: any) => void
) => {
  const [apiSource, setApiSource] = useState<"platform" | "custom">(
    provider === "ollama" ? "custom" : "platform"
  );

  useEffect(() => {
    if (provider === "ollama") {
      setApiSource("custom");
      // 只设置默认值，不强制覆盖已有值
      if (!setValue("customProviderUrl")) {
        setValue(
          "customProviderUrl",
          "http://localhost:11434/v1/chat/completions"
        );
      }
      setValue("useServerProxy", false);
      setValue("apiKey", ""); // 清空 API Key
    } else if (apiSource === "platform") {
      setValue("apiKey", "");
      setValue("customProviderUrl", "");
    }
  }, [provider, apiSource, setValue]);

  return {
    apiSource,
    setApiSource,
    isOllama: provider === "ollama",
  };
};
