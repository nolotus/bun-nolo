// database/server/signup.ts
// 功能：注册接口 + 按 IP 灵活配额限制（默认：同一 IP 每日仅允许注册 1 个）
//
// 说明：
// - 可配置多窗口配额（如：1日2个、7日5个、30日x个）
// - 当前默认只启用 { days: 1, limit: 1 }，满足“一日一个”
// - 统计基于“每天一个计数键”，多窗口时累加最近 N 天的键值判断
// - 实现简单，易于落地；适用于配额 N<=30 的场景

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

/** ------------------ 可配置的 IP 配额 ------------------ **
 * 配置示例：
 * - 仅每日 1 个：[{ days: 1, limit: 1 }]
 * - 每日 2 个 + 7 日 5 个：[{ days: 1, limit: 2 }, { days: 7, limit: 5 }]
 * - 每日 2 个 + 7 日 5 个 + 30 日 10 个：[{ days: 1, limit: 2 }, { days: 7, limit: 5 }, { days: 30, limit: 10 }]
 */
const IP_QUOTAS: Array<{ days: number; limit: number }> = [
  { days: 1, limit: 1 }, // 当前需求：一日一个
  // { days: 7, limit: 5 },
  // { days: 30, limit: 10 },
];

/** ------------------ IP 限制相关 ------------------ **/

const ABUSE_PREFIX = {
  byIpDay: (ip: string, day: string) => `abuse:signup:ip:${ip}:${day}`, // value: stringified number
};

function getDayKey(d: Date = new Date()) {
  // e.g., 20251101
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function getDayKeysBackwards(days: number): string[] {
  // 含今天在内，往前数 N 天
  const keys: string[] = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    keys.push(getDayKey(d));
  }
  return keys;
}

// 从代理头中尽可能获取真实来源 IP；不信任 body.clientIp，仅用于日志
function getClientIp(req: Request): string | null {
  try {
    const h = req.headers;
    const cfIp = h.get("cf-connecting-ip");
    const realIp = h.get("x-real-ip");
    const xff = h.get("x-forwarded-for");
    const xffIp = xff?.split(",")[0]?.trim();

    const ip = cfIp || realIp || xffIp || "";
    if (ip && ip !== "unknown") return ip;

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

// 读取单日计数（不存在即 0）
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

// 累加最近 N 天计数
async function getIpCountInDays(ip: string, days: number): Promise<number> {
  const keys = getDayKeysBackwards(days);
  const counts = await Promise.all(keys.map((k) => getIpDayCount(ip, k)));
  return counts.reduce((a, b) => a + b, 0);
}

// 生成人类可读的窗口描述
function windowLabel(days: number) {
  if (days === 1) return "今日";
  if (days === 7) return "近7日";
  if (days === 30) return "近30日";
  return `近${days}日`;
}

// 检查多窗口配额，若任一窗口超限则拒绝
async function checkIpQuotas(ip: string, t: any) {
  for (const q of IP_QUOTAS) {
    const used = await getIpCountInDays(ip, q.days);
    if (used >= q.limit) {
      const msg = `${windowLabel(q.days)}该 IP 注册数已达上限（限制：${q.limit}）`;
      return createErrorResponse(
        t ? t("errors.ipQuotaExceeded", { defaultValue: msg }) : msg,
        429
      );
    }
  }
  return null;
}

// 成功注册后记录“今天 +1”
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

/** ------------------ 原有辅助函数（携带 t） ------------------ **/

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

/** ------------------ 主处理函数 ------------------ **/

export async function handleSignUp(req: Request) {
  let t: any = null;
  try {
    const acceptLanguage = req.headers.get("accept-language");
    const lng = acceptLanguage?.split(",")[0] || "zh-CN";
    t = await i18nServer.cloneInstance({ lng }).init();

    // 1) 方法校验
    const methodValidation = validateRequestMethod((req as any).method, t);
    if (methodValidation) return methodValidation;

    // 2) 解析 body（若上层是原生 Fetch Request，请改为：const body = await req.json();）
    const body: any = (req as any).body;
    const userDataResult = extractUserData(body, t);
    if (userDataResult instanceof Response) return userDataResult;
    const { username, publicKey, locale, email, inviterId } = userDataResult;

    // 3) IP 配额检查（灵活多窗口；默认仅“每日1个”）
    const ip = getClientIp(req);
    if (ip) {
      const quotaRes = await checkIpQuotas(ip, t);
      if (quotaRes) {
        logger.warn({ ip, username }, "Blocked signup due to IP quota limit.");
        return quotaRes;
      }
    } else {
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

    // 6) 成功注册后记录“今日 +1”，参与后续配额判断
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

    // 7) 充值逻辑（保持原样）
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
