// proxyUtils.ts
import {AxiosRequestConfig} from 'axios';
import {getProxyConfig} from './proxyConfig';

export const getProxyAxiosConfig = (): AxiosRequestConfig => {
  const agent = getProxyConfig();
  return {
    httpsAgent: agent,
  };
};
