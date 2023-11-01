import { serverGetData } from 'database/server/read';

import { verifyToken, parseToken } from '../token';

const handleError = (res, error) => {
  console.error(error);
  const status = error.message === 'Access denied' ? 401 : 500;
  return res.status(status).json({ error: error.message });
};

export async function handleToken(req, res) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return handleError(res, new Error('Access denied. No token provided.'));
  }

  try {
    const payload = parseToken(token);
    const id = `0-${payload.userId}-publicKey`;
    const publicKeyBase64Url = await serverGetData(id);
    const isAllow = verifyToken(token, publicKeyBase64Url);

    if (isAllow) {
      return payload;
    }
  } catch (err) {
    console.error('JWT verification error:', err); // Debugging line
    return handleError(res, err);
  }
}
