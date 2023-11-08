import { handleSyncRequest } from './sync';

import { logIn, signUp } from './';

export const userServerRoute = (req, res) => {
  const { url } = req;
  if (url.pathname.endsWith('/login')) {
    console.log('Processing login');
    return logIn(req, res);
  }
  if (url.pathname.endsWith('/signup')) {
    console.log('Processing signup');
    return signUp(req, res);
  }

  if (url.pathname.endsWith('/sync')) {
    console.log('Processing signup');
    return handleSyncRequest(req, res);
  } else {
    return new Response('user');
  }
};
