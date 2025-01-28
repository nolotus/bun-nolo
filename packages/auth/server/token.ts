import { verifyToken } from "../token";
import serverDb from "database/server/db";

const handleError = (res, error, status = 500) => {
  return res.status(status).json({ error: error.message });
};

const getPublicKey = async (userId) => {
  // 先尝试获取新用户的公钥
  try {
    const newUser = await serverDb.get(`user:${userId}`);
    if (newUser?.publicKey) {
      return {
        publicKey: newUser.publicKey,
        isNewUser: true,
      };
    }
  } catch (err) {}
};

export async function handleToken(req, res) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return handleError(
      res,
      new Error("Access denied. No token provided."),
      401
    );
  }

  try {
    // 从token中获取未验证的userId
    const [payloadBase64Url] = token.split(".");
    const tempPayload = JSON.parse(atob(payloadBase64Url));

    // 获取公钥并判断用户类型
    const { publicKey, isNewUser } = await getPublicKey(tempPayload.userId);

    if (!publicKey) {
      return handleError(res, new Error("Public key not found"), 401);
    }

    // 验证token
    const payload = verifyToken(token, publicKey);
    if (!payload) {
      return handleError(res, new Error("Invalid token"), 401);
    }

    // 检查token是否过期
    const currentTime = new Date().getTime();
    const expTime = new Date(payload.exp).getTime();

    if (currentTime > expTime) {
      return handleError(res, new Error("Token has expired"), 401);
    }

    // 检查token是否已经生效
    const nbfTime = new Date(payload.nbf).getTime();
    if (currentTime < nbfTime) {
      return handleError(res, new Error("Token not yet active"), 401);
    }

    // 返回包含用户类型的payload
    return {
      ...payload,
      isNewUser,
    };
  } catch (err) {
    return handleError(res, err);
  }
}
