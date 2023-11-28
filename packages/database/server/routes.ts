import { handleToken } from 'auth/server/token';

import { API_ENDPOINTS } from '../config';
import { handleQuery } from '../query';

import { handleDelete } from './delete'; // 确保你导入了这个函数
import { handleReadSingle } from './read';
import { handleReadAll } from './readAll';
import { handleUpdate } from './update';
import { handleWrite } from './write';

export const databaseRequest = async (req, res, url) => {
  const pathname = url.pathname;

  const getIdFromPath = (prefix) => {
    const start = pathname.indexOf(prefix) + prefix.length;
    const end =
      pathname.indexOf('/', start) !== -1
        ? pathname.indexOf('/', start)
        : undefined;
    return pathname.slice(start, end);
  };
  if (pathname.startsWith(API_ENDPOINTS.DATABASE)) {
    const operation = pathname
      .substr(API_ENDPOINTS.DATABASE.length)
      .split('/')[1];

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
      case 'delete': // 新增的删除操作
        req.user = await handleToken(req, res);
        req.params = { id: getIdFromPath('/api/v1/db/delete/') };
        return handleDelete(req, res); // 确保你有这个函数
      default:
        return new Response('database');
    }
  }
};
