// database/server/signup.ts (完整最终版本 - 含同一 IP 每日仅允许注册 1 个)

import i18nServer from "app/i18n/i18n.server";
import serverDb from "database/server/db.js";
import { reject } from "rambda";
import { signMessage } from "core/crypto";
import { generateUserIdV1 } from "core/generateMainKey";
import {
  createErrorResponse,
  createSuccessResponse,
  handleOptionsRequest,
} from "./shared";
import { DB_PREFIX, createUserKey } from "database/keys";
import pino from "pino";
import { ulid } from "ulid";
import { rechargeUserBalance } from "auth/server/recharge";
import { prepareUserSettings } from "app/settings/prepareUserSetting";

const logger = pino({ name: "signup" });

/** ---------- IP 限制相关 ---------- **/
const ABUSE_PREFIX = {
  byIpDay: (ip: string, day: string) => `abuse:signup:ip:${ip}:${day}`,
};

function getDayKey(d = new Date()) {
  // 形如 20251101
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

// 从代理头中尽可能获取真实来源 IP；不信任客户端传来的 body.clientIp
function getClientIp(req: Request): string | null {
  try {
    const h = req.headers;
    const cfIp = h.get("cf-connecting-ip");
    const realIp = h.get("x-real-ip");
    const xff = h.get("x-forwarded-for");

    // x-forwarded-for 可能是多个 IP，用第一个
    const xffIp = xff?.split(",")[0]?.trim();

    const ip = cfIp || realIp || xffIp || "";
    if (ip && ip !== "unknown") return ip;

    // 作为兜底：某些环境可以从 remote-addr/forwarded 获取
    const forwarded = h.get("forwarded"); // e.g., for=1.2.3.4;
    if (forwarded) {
      const m = forwarded.match(/for="?([^;"]+)"?/i);
      if (m?.[1]) return m[1];
    }
    return null;
  } catch {
    return null;
  }
}

// 检查当日同一 IP 是否已注册过（达到 1 次则拒绝）
async function checkIpQuota(ip: string, t: any) {
  const dayKey = getDayKey();
  const key = ABUSE_PREFIX.byIpDay(ip, dayKey);
  try {
    const count = Number(await serverDb.get(key));
    if (count >= 1) {
      // 返回 429 Too Many Requests
      return createErrorResponse(
        t
          ? t("errors.ipQuotaExceeded")
          : "Too many registrations from this IP today",
        429
      );
    }
  } catch (e: any) {
    if (e?.code !== "LEVEL_NOT_FOUND") {
      throw e;
    }
    // 未找到表示今天还没有注册过，放行
  }
  return null;
}

// 成功注册后记录当日次数 +1
async function recordIpRegistration(ip: string) {
  const dayKey = getDayKey();
  const key = ABUSE_PREFIX.byIpDay(ip, dayKey);
  let count = 0;
  try {
    count = Number(await serverDb.get(key)) || 0;
  } catch (e: any) {
    // LEVEL_NOT_FOUND 则从 0 开始
  }
  await serverDb.put(key, String(count + 1));
}

/** ---------- 原有辅助函数（将 t 作为参数传入） ---------- **/

function validateRequestMethod(method: string, t: any) {
  if (method === "OPTIONS") {
    return handleOptionsRequest();
  }
  if (method !== "POST") {
    return createErrorResponse(t("errors.methodNotAllowed"), 405);
  }
  return null;
}

function extractUserData(body: any, t: any) {
  // clientIp 如果从前端传来，仅用于日志参考，不参与风控判定
  const { username, publicKey, locale, email, inviterId } = body || {};
  if (!username || !publicKey || !locale) {
    return createErrorResponse(t("errors.missingFields"), 400);
  }
  return { username, publicKey, locale, email, inviterId };
}

function generateUserId(publicKey: string, username: string, locale: string) {
  return generateUserIdV1(publicKey, username, locale);
}

async function checkUserExists(userId: string, t: any) {
  try {
    const existingUser = await serverDb.get(DB_PREFIX.USER + userId);
    if (existingUser) {
      return createErrorResponse(t("errors.dataExists", { id: userId }), 409);
    }
  } catch (err: any) {
    if (err.code !== "LEVEL_NOT_FOUND") {
      throw err;
    }
  }
  return null;
}

function prepareUserData(userData: any) {
  return reject((x) => x === null || x === undefined, {
    username: userData.username,
    publicKey: userData.publicKey,
    locale: userData.locale,
    createdAt: Date.now(),
    email: userData.email,
    inviterId: userData.inviterId,
    balance: 0,
    balanceUpdatedAt: Date.now(),
  });
}

function prepareUserProfile(username: string, email?: string) {
  return {
    nickname: username,
    avatar: "",
    bio: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    email,
  };
}

async function saveUserDataToDb(
  userId: string,
  userData: any,
  userSettings: any,
  userProfile: any
) {
  await serverDb.batch([
    { type: "put", key: DB_PREFIX.USER + userId, value: userData },
    { type: "put", key: createUserKey.settings(userId), value: userSettings },
    { type: "put", key: createUserKey.profile(userId), value: userProfile },
  ]);
}

function signUserMessage(
  username: string,
  userId: string,
  publicKey: string,
  t: any
) {
  const message = JSON.stringify({ username, userId, publicKey });
  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    return createErrorResponse(t("errors.secretKeyMissing"), 500);
  }
  return signMessage(message, secretKey);
}

/** ---------- 主处理函数 ---------- **/

export async function handleSignUp(req: Request) {
  let t: any = null; // 在 try 外部声明 t，以便 catch 中也能访问
  try {
    const acceptLanguage = req.headers.get("accept-language");
    const lng = acceptLanguage?.split(",")[0] || "zh-CN";
    t = await i18nServer.cloneInstance({ lng }).init();

    // 1) 方法校验
    const methodValidation = validateRequestMethod((req as any).method, t);
    if (methodValidation) return methodValidation;

    // 2) 解析 body
    // 注意：这里假设上层已解析出 req.body 是对象；若是原始 Fetch Request，请改为：const body = await req.json();
    const body: any = (req as any).body;
    const userDataResult = extractUserData(body, t);
    if (userDataResult instanceof Response) return userDataResult;
    const { username, publicKey, locale, email, inviterId } = userDataResult;

    // 3) IP 限制：同一 IP 当天仅允许注册 1 次
    const ip = getClientIp(req);
    if (ip) {
      const ipCheck = await checkIpQuota(ip, t);
      if (ipCheck) {
        logger.warn({ ip, username }, "Blocked signup due to daily IP limit.");
        return ipCheck;
      }
    } else {
      // 未能识别 IP 时，仅记录告警但不阻断（可改为阻断按需）
      logger.warn({ username }, "Could not determine client IP for signup.");
    }

    // 4) 生成 userId 并查重
    const userId = generateUserId(publicKey, username, locale);
    const userExistsResult = await checkUserExists(userId, t);
    if (userExistsResult) return userExistsResult;

    // 5) 组装数据并落库
    const userData = prepareUserData(userDataResult);
    const userSettings = prepareUserSettings(locale);
    const userProfile = prepareUserProfile(username, email);

    await saveUserDataToDb(userId, userData, userSettings, userProfile);

    // 6) 成功注册后，记录当日 IP 次数 +1（用于下一次拦截）
    if (ip) {
      try {
        await recordIpRegistration(ip);
      } catch (e) {
        logger.warn(
          { ip, userId, err: e },
          "Failed to record IP registration count."
        );
      }
    }

    // 7) 充值逻辑（可保留或按需调整）
    const initialBalance = inviterId ? 6.6 : 2;
    const reason = inviterId ? "invited_signup_bonus" : "new_user_bonus";
    const initialRechargeResult = await rechargeUserBalance(
      userId,
      initialBalance,
      reason,
      `signup_${userId}_${ulid()}`
    );

    if (!initialRechargeResult.success) {
      logger.error(
        { userId, initialBalance, error: initialRechargeResult.error },
        "CRITICAL: Failed to credit initial balance for new user."
      );
    }

    if (inviterId) {
      const inviterReward = 1;
      const inviterRewardReason = `invite_reward_for_${userId}`;
      const inviterRechargeResult = await rechargeUserBalance(
        inviterId,
        inviterReward,
        inviterRewardReason,
        `invite_${inviterId}_${userId}_${ulid()}`
      );

      if (!inviterRechargeResult.success) {
        logger.warn(
          { inviterId, userId, error: inviterRechargeResult.error },
          "Failed to credit inviter for new user signup."
        );
      }
    }

    // 8) 使用服务端密钥签名返回数据
    const encryptedDataResult = signUserMessage(username, userId, publicKey, t);
    if (encryptedDataResult instanceof Response) return encryptedDataResult;
    const encryptedData = encryptedDataResult;

    return createSuccessResponse({ encryptedData });
  } catch (error) {
    logger.error({ error }, "An unexpected error occurred during signup.");
    const errorMessage = t
      ? t("errors.internalServerError")
      : "Internal Server Error";
    return createErrorResponse(errorMessage, 500);
  }
}
