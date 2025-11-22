// database/server/signup.ts
// 注册接口（按 IP 配额限制，默认：同一 IP 每日仅允许注册 1 个；支持灵活扩展周/月窗口）

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

/**
 * 可配置的 IP 配额：
 * - 当前默认：每日 1 个
 * - 示例（未来可改）：[{ days: 1, limit: 2 }, { days: 7, limit: 5 }, { days: 30, limit: 10 }]
 */
const IP_QUOTAS: Array<{ days: number; limit: number }> = [
  { days: 1, limit: 1 },
];

/** ========== IP 配额计数 ========== */

const ABUSE_PREFIX = {
  byIpDay: (ip: string, day: string) => `abuse:signup:ip:${ip}:${day}`, // value: string number
};

function getDayKey(d: Date = new Date()) {
  // e.g., 20251101
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function getDayKeysBackwards(days: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    keys.push(getDayKey(d));
  }
  return keys;
}

async function getIpDayCount(ip: string, dayKey: string): Promise<number> {
  try {
    const val = await serverDb.get(ABUSE_PREFIX.byIpDay(ip, dayKey));
    const n = Number(val);
    return Number.isFinite(n) ? n : 0;
  } catch (e: any) {
    if (e?.code === "LEVEL_NOT_FOUND") return 0;
    throw e;
  }
}

async function getIpCountInDays(ip: string, days: number): Promise<number> {
  const keys = getDayKeysBackwards(days);
  const counts = await Promise.all(keys.map((k) => getIpDayCount(ip, k)));
  return counts.reduce((a, b) => a + b, 0);
}

function windowLabel(days: number) {
  if (days === 1) return "今日";
  if (days === 7) return "近7日";
  if (days === 30) return "近30日";
  return `近${days}日`;
}

async function checkIpQuotas(ip: string, t: any) {
  for (const q of IP_QUOTAS) {
    const used = await getIpCountInDays(ip, q.days);
    if (used >= q.limit) {
      const defaultMsg = `${windowLabel(q.days)}该 IP 注册数已达上限（限制：${q.limit}）`;
      const msg =
        typeof t === "function"
          ? t("errors.ipQuotaExceeded") || defaultMsg
          : defaultMsg;
      return createErrorResponse(msg, 429);
    }
  }
  return null;
}

async function recordIpRegistration(ip: string) {
  const today = getDayKey();
  const key = ABUSE_PREFIX.byIpDay(ip, today);
  let count = 0;
  try {
    count = Number(await serverDb.get(key)) || 0;
  } catch (e: any) {
    // LEVEL_NOT_FOUND => 从 0 开始
  }
  await serverDb.put(key, String(count + 1));
}

/** ========== 原有辅助函数（传入 t） ========== */

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

/** ========== 主处理函数（仅依赖 req.ip，不再从 headers 回退解析） ========== */

export async function handleSignUp(req: any) {
  let t: any = null; // 在 try 外声明 t，catch 中可用
  try {
    // i18n（仍从 headers 读取语言，这个在上游已透传）
    const acceptLanguage: string | null = req.headers?.get("accept-language");
    const lng = acceptLanguage?.split(",")[0] || "zh-CN";
    t = await i18nServer.cloneInstance({ lng }).init();

    // 1) 方法校验
    const methodValidation = validateRequestMethod(req.method, t);
    if (methodValidation) return methodValidation;

    // 2) 解析 body 并校验
    const userDataResult = extractUserData(req.body, t);
    if (userDataResult instanceof Response) return userDataResult;
    const { username, publicKey, locale, email, inviterId } = userDataResult;

    // 3) 取 IP：仅依赖上游注入的 req.ip
    const ip: string | null = req.ip || null;

    if (ip) {
      // 多窗口配额检查（默认仅“每日 1 个”）
      const quotaRes = await checkIpQuotas(ip, t);
      if (quotaRes) {
        logger.warn(
          { ip, username, reportedClientIp: req?.reportedClientIp },
          "Blocked signup due to IP quota limit."
        );
        return quotaRes;
      }
    } else {
      // 若上游没有提供 IP，这里仅记录；如需严格限制，可改为直接返回 400/403
      logger.warn(
        { username, reportedClientIp: req?.reportedClientIp },
        "Could not determine client IP for signup."
      );
    }

    // 4) 生成 userId 并查重
    const userId = generateUserId(publicKey, username, locale);
    const userExistsResult = await checkUserExists(userId, t);
    if (userExistsResult) return userExistsResult;

    // 5) 组装并写入
    const userData = prepareUserData(userDataResult);
    const userSettings = prepareUserSettings(locale);
    const userProfile = prepareUserProfile(username, email);
    await saveUserDataToDb(userId, userData, userSettings, userProfile);

    // 6) 成功后计入“今日 +1”
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

    // 7) 赠送余额（保持原逻辑）
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

    // 8) 签名返回
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
