import { serve } from 'bun';

import { assets } from '../../public/assets.json';

import { handleRequest } from './request';
export const startServer = async () => {
  if (process.env.NODE_ENV === 'production') {
    serve({
      port: 443,
      hostname: '0.0.0.0',
      fetch: (request) => handleRequest(request, assets),
      tls: {
        key: Bun.file('./key.pem'),
        cert: Bun.file('./cert.pem'),
        ca: Bun.file('./ca.pem'),
      },
    });
  }

  // 启动 http 服务器
  serve({
    port: 80,
    hostname: '0.0.0.0',
    fetch: (request) => handleRequest(request, assets),
  });
};
startServer();
