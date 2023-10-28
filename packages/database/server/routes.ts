import { handleToken } from 'auth/server/token';

import { API_ENDPOINTS } from '../config';
import { handleQuery } from '../query';

import { handleReadSingle } from './read';
import { handleReadAll } from './readAll';
import { handleUpdate } from './update';
import { handleWrite } from './write';
export const DatabaseRequest = async (req, res, url) => {
  const pathname = url.pathname;

  const getIdFromPath = (prefix) => pathname.split(prefix)[1];

  if (pathname.startsWith(API_ENDPOINTS.DATABASE)) {
    const operation = pathname.split(API_ENDPOINTS.DATABASE)[1].split('/')[0];

    switch (operation) {
      case 'read':
        req.params = { id: getIdFromPath('/api/v1/db/read/') };
        return handleReadSingle(req, res);
      case 'readAll':
        return handleReadAll(req, res);
      case 'write':
        req.user = await handleToken(req, res);
        return handleWrite(req, res);

      case 'update':
        req.user = await handleToken(req, res);
        req.params = { id: getIdFromPath('/api/v1/db/update/') };
        return handleUpdate(req, res);

      case 'query':
        req.params = { userId: getIdFromPath('/api/v1/db/query/') };
        return handleQuery(req, res);

      default:
        return new Response('database');
    }
  }
};
