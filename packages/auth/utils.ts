// path auth/utils.ts
import { verifyToken } from "auth/token";
import serverDb from "database/server/db";

export const CORS_HEADERS_AUTH = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export const authErrorResponse = (
  msg: string,
  code: string,
  status: number = 500
): Response =>
  new Response(JSON.stringify({ error: { message: msg, code } }), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS_AUTH },
  });

const getPublicKey = async (userId: string) => {
  try {
    const u = await serverDb.get(`user:${userId}`);
    if (!u?.publicKey || u.balance <= 0 || u.isDisabled) {
      return { publicKey: null, isValid: false };
    }
    return { publicKey: u.publicKey, isValid: true };
  } catch (e) {
    return { publicKey: null, isValid: false };
  }
};

export const authenticateRequest = async (
  req: Request
): Promise<{ userId: string; isNewUser?: boolean } | Response> => {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) {
    return authErrorResponse(
      "No authentication token provided.",
      "AUTH_NO_TOKEN",
      401
    );
  }

  try {
    const tokenHeaderPayload = JSON.parse(atob(token.split(".")[0]));
    const userIdFromTokenHeader = tokenHeaderPayload.userId;

    if (!userIdFromTokenHeader) {
      return authErrorResponse(
        "Invalid token format.",
        "AUTH_INVALID_TOKEN",
        401
      );
    }

    const { publicKey, isValid } = await getPublicKey(userIdFromTokenHeader);
    if (!isValid || !publicKey) {
      return authErrorResponse("Invalid account.", "AUTH_ACCOUNT_INVALID", 401);
    }

    const decodedTokenData = verifyToken(token, publicKey);
    if (!decodedTokenData) {
      return authErrorResponse(
        "Invalid token signature.",
        "AUTH_INVALID_TOKEN",
        401
      );
    }

    const now = Date.now();
    if (now > new Date(decodedTokenData.exp).getTime()) {
      return authErrorResponse("Token has expired.", "AUTH_TOKEN_EXPIRED", 401);
    }
    if (
      decodedTokenData.nbf &&
      now < new Date(decodedTokenData.nbf).getTime()
    ) {
      return authErrorResponse(
        "Token not yet active.",
        "AUTH_TOKEN_NOT_ACTIVE",
        401
      );
    }

    return { ...decodedTokenData, userId: userIdFromTokenHeader };
  } catch (e: any) {
    return authErrorResponse(
      `Authentication failed: ${e.message}.`,
      "AUTH_VERIFICATION_FAILED",
      401
    );
  }
};
