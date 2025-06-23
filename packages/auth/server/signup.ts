// database/server/signup.ts
import { t } from "i18next";
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

// --- 新增引入 ---
import { ulid } from "ulid"; // 用于为初始充值生成唯一的交易ID
import { rechargeUserBalance } from "../../auth/server/recharge"; // 引入充值函数

const logger = pino({ name: "signup" });

function validateRequestMethod(method) {
  if (method === "OPTIONS") {
    return handleOptionsRequest();
  }
  if (method !== "POST") {
    return createErrorResponse("Method not allowed", 405);
  }
  return null;
}

function extractUserData(body) {
  const { username, publicKey, locale, email, inviterId } = body;
  if (!username || !publicKey || !locale) {
    return createErrorResponse("Missing required fields", 400);
  }
  return { username, publicKey, locale, email, inviterId };
}

function generateUserId(publicKey, username, locale) {
  return generateUserIdV1(publicKey, username, locale);
}

async function checkUserExists(userId) {
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

// --- 改变点 ---
// 用户数据准备函数现在将初始余额设置为0
// 余额将通过 recharge 函数安全地增加
function prepareUserData(userData) {
  return reject((x) => x === null || x === undefined, {
    username: userData.username,
    publicKey: userData.publicKey,
    locale: userData.locale,
    createdAt: Date.now(),
    email: userData.email,
    inviterId: userData.inviterId,
    balance: 0, // 改变点：初始余额设置为 0
    balanceUpdatedAt: Date.now(),
  });
}

function prepareUserSettings(locale) {
  return {
    theme: "system",
    language: locale,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
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
  // 这个函数保持不变，它原子性地创建用户的基本记录
  await serverDb.batch([
    {
      type: "put",
      key: DB_PREFIX.USER + userId,
      value: userData,
    },
    {
      type: "put",
      key: createUserKey.settings(userId),
      value: userSettings,
    },
    {
      type: "put",
      key: createUserKey.profile(userId),
      value: userProfile,
    },
  ]);
}

function signUserMessage(username, userId, publicKey) {
  const message = JSON.stringify({
    username,
    userId,
    publicKey,
  });

  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    return createErrorResponse(t("errors.secretKeyMissing"), 500);
  }

  return signMessage(message, secretKey);
}

// --- 已移除 ---
// updateInviterBalance 函数被移除，因为它的功能现在由 rechargeUserBalance 替代

export async function handleSignUp(req) {
  try {
    const methodValidation = validateRequestMethod(req.method);
    if (methodValidation) return methodValidation;

    const userDataResult = extractUserData(req.body);
    if (userDataResult instanceof Response) return userDataResult;
    const { username, publicKey, locale, email, inviterId } = userDataResult;

    const userId = generateUserId(publicKey, username, locale);

    const userExistsResult = await checkUserExists(userId);
    if (userExistsResult) return userExistsResult;

    const userData = prepareUserData(userDataResult);
    const userSettings = prepareUserSettings(locale);
    const userProfile = prepareUserProfile(username, email);

    // 步骤1: 创建用户，此时余额为0
    await saveUserDataToDb(userId, userData, userSettings, userProfile);

    // --- 新增逻辑：使用 rechargeUserBalance 来发放初始奖励 ---

    // 步骤2: 为新注册用户充值初始余额
    const initialBalance = inviterId ? 6.6 : 1;
    const reason = inviterId ? "invited_signup_bonus" : "new_user_bonus";
    const initialRechargeResult = await rechargeUserBalance(
      userId,
      initialBalance,
      reason,
      `signup_${userId}_${ulid()}` // 创建一个唯一的、可追溯的交易ID
    );

    if (!initialRechargeResult.success) {
      // 这是一个严重问题，用户已创建但没有获得初始余额
      // 记录严重错误，以便后续手动补偿或排查
      logger.error(
        { userId, initialBalance, error: initialRechargeResult.error },
        "CRITICAL: Failed to credit initial balance for new user."
      );
    }

    // 步骤3: 如果有邀请人，为邀请人充值奖励
    if (inviterId) {
      const inviterReward = 1;
      const inviterRewardReason = `invite_reward_for_${userId}`;
      const inviterRechargeResult = await rechargeUserBalance(
        inviterId,
        inviterReward,
        inviterRewardReason,
        `invite_${inviterId}_${userId}_${ulid()}` // 同样创建唯一ID
      );

      if (!inviterRechargeResult.success) {
        // 同样记录此失败情况
        logger.warn(
          { inviterId, userId, error: inviterRechargeResult.error },
          "Failed to credit inviter for new user signup."
        );
      }
    }

    // 步骤4: 为客户端签名数据，用于自动登录
    const encryptedDataResult = signUserMessage(username, userId, publicKey);
    if (encryptedDataResult instanceof Response) return encryptedDataResult;
    const encryptedData = encryptedDataResult;

    return createSuccessResponse({ encryptedData });
  } catch (error) {
    logger.error({ error }, "An unexpected error occurred during signup.");
    return createErrorResponse("Internal server error", 500);
  }
}
