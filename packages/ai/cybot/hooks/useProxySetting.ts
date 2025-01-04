import { useEffect } from "react";

// 定义 useProxySetting Hook
export const useProxySetting = (
  provider: string,
  setValue: (field: string, value: any) => void
) => {
  const PROXY_DISABLED_PROVIDERS = ["ollama", "custom", "deepseek"];

  useEffect(() => {
    if (PROXY_DISABLED_PROVIDERS.includes(provider)) {
      setValue("useServerProxy", false);
    } else {
      setValue("useServerProxy", true);
    }
  }, [provider, setValue]);

  const isProxyDisabled = PROXY_DISABLED_PROVIDERS.includes(provider);
  return isProxyDisabled;
};
