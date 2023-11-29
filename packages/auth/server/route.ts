import { handleSyncRequest } from 'user/server/sync';

import { handleLogin } from './login';
import { handleRegister } from './register';
export const authServerRoutes = (req, res) => {
  const { url } = req;
  if (url.pathname.endsWith('/login')) {
    return handleLogin(req, res);
  }
  if (url.pathname.endsWith('/register')) {
    return handleRegister(req, res);
  }

  if (url.pathname.endsWith('/sync')) {
    return handleSyncRequest(req, res);
  } else {
    return new Response('user');
  }
};
