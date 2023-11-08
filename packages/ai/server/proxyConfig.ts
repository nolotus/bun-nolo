// proxyConfig.ts
import { AxiosRequestConfig } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { getLogger } from 'utils/logger';

const openAiLogger = getLogger('OpenAI');

export const getProxyConfig = (): AxiosRequestConfig['httpsAgent'] => {
  const useProxy = process.env.USE_PROXY === 'true';

  if (useProxy) {
    openAiLogger.info('Using proxy for OpenAI API requests');
    const PROXY_URL = 'http://127.0.0.1:10080';
    return new HttpsProxyAgent(PROXY_URL);
  }

  openAiLogger.info('Not using proxy for OpenAI API requests');
  return null;
};
