// database/server/signup.ts (完整最终版本 - 已修复作用域问题)

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

// 1. 将 t 作为参数传入
function validateRequestMethod(method, t) {
  if (method === "OPTIONS") {
    return handleOptionsRequest();
  }
  if (method !== "POST") {
    return createErrorResponse(t("errors.methodNotAllowed"), 405);
  }
  return null;
}

// 1. 将 t 作为参数传入
function extractUserData(body, t) {
  const { username, publicKey, locale, email, inviterId } = body;
  if (!username || !publicKey || !locale) {
    return createErrorResponse(t("errors.missingFields"), 400);
  }
  return { username, publicKey, locale, email, inviterId };
}

function generateUserId(publicKey, username, locale) {
  return generateUserIdV1(publicKey, username, locale);
}

// 1. 将 t 作为参数传入
async function checkUserExists(userId, t) {
  try {
    const existingUser = await serverDb.get(DB_PREFIX.USER + userId);
    if (existingUser) {
      return createErrorResponse(t("errors.dataExists", { id: userId }), 409);
    }
  } catch (err) {
    if (err.code !== "LEVEL_NOT_FOUND") {
      throw err;
    }
  }
  return null;
}

function prepareUserData(userData) {
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

function prepareUserProfile(username, email) {
  return {
    nickname: username,
    avatar: "",
    bio: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    email,
  };
}

async function saveUserDataToDb(userId, userData, userSettings, userProfile) {
  await serverDb.batch([
    { type: "put", key: DB_PREFIX.USER + userId, value: userData },
    { type: "put", key: createUserKey.settings(userId), value: userSettings },
    { type: "put", key: createUserKey.profile(userId), value: userProfile },
  ]);
}

// 1. 将 t 作为参数传入
function signUserMessage(username, userId, publicKey, t) {
  const message = JSON.stringify({ username, userId, publicKey });
  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    return createErrorResponse(t("errors.secretKeyMissing"), 500);
  }
  return signMessage(message, secretKey);
}

export async function handleSignUp(req) {
  let t = null; // 在 try 外部声明 t，以便 catch 中也能访问
  try {
    const acceptLanguage = req.headers.get("accept-language");
    const lng = acceptLanguage?.split(",")[0] || "zh-CN";
    t = await i18nServer.cloneInstance({ lng }).init();

    // 2. 调用时传入 t
    const methodValidation = validateRequestMethod(req.method, t);
    if (methodValidation) return methodValidation;

    // 2. 调用时传入 t
    const userDataResult = extractUserData(req.body, t);
    if (userDataResult instanceof Response) return userDataResult;
    const { username, publicKey, locale, email, inviterId } = userDataResult;

    const userId = generateUserId(publicKey, username, locale);

    // 2. 调用时传入 t
    const userExistsResult = await checkUserExists(userId, t);
    if (userExistsResult) return userExistsResult;

    const userData = prepareUserData(userDataResult);
    const userSettings = prepareUserSettings(locale);
    const userProfile = prepareUserProfile(username, email);

    await saveUserDataToDb(userId, userData, userSettings, userProfile);

    const initialBalance = inviterId ? 6.6 : 1;
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

    // 2. 调用时传入 t
    const encryptedDataResult = signUserMessage(username, userId, publicKey, t);
    if (encryptedDataResult instanceof Response) return encryptedDataResult;
    const encryptedData = encryptedDataResult;

    return createSuccessResponse({ encryptedData });
  } catch (error) {
    logger.error({ error }, "An unexpected error occurred during signup.");
    // 3. 在 catch 块中安全地使用 t
    const errorMessage = t
      ? t("errors.internalServerError")
      : "Internal Server Error";
    return createErrorResponse(errorMessage, 500);
  }
}
