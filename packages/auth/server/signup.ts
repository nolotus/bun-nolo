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

/**
 * 检查请求方法是否为 OPTIONS 或 POST
 * @param method 请求方法
 * @returns 如果是 OPTIONS 返回处理结果，否则返回 null 或错误响应
 */
function validateRequestMethod(method: string): Response | null {
  if (method === "OPTIONS") {
    return handleOptionsRequest();
  }
  if (method !== "POST") {
    return createErrorResponse("Method not allowed", 405);
  }
  return null;
}

/**
 * 从请求体中提取用户注册数据
 * @param body 请求体
 * @returns 用户注册数据或错误响应
 */
function extractUserData(body: any): Record<string, any> | Response {
  const { username, publicKey, locale, email } = body;
  if (!username || !publicKey || !locale) {
    return createErrorResponse("Missing required fields", 400);
  }
  return { username, publicKey, locale, email };
}

/**
 * 生成用户ID
 * @param publicKey 公钥
 * @param username 用户名
 * @param locale 语言环境
 * @returns 用户ID
 */
function generateUserId(
  publicKey: string,
  username: string,
  locale: string
): string {
  return generateUserIdV1(publicKey, username, locale);
}

/**
 * 检查用户是否已存在
 * @param userId 用户ID
 * @returns 如果用户存在返回错误响应，否则返回 null
 */
async function checkUserExists(userId: string): Promise<Response | null> {
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

/**
 * 准备用户基础数据
 * @param userData 用户注册数据
 * @returns 清理后的用户基础数据
 */
function prepareUserData(userData: Record<string, any>): Record<string, any> {
  return reject((x) => x === null || x === undefined, {
    username: userData.username,
    publicKey: userData.publicKey,
    locale: userData.locale,
    createdAt: Date.now(),
    email: userData.email,
    balance: 1,
    balanceUpdatedAt: Date.now(),
  });
}

/**
 * 准备用户设置数据
 * @param locale 语言环境
 * @returns 用户设置数据
 */
function prepareUserSettings(locale: string): Record<string, any> {
  return {
    theme: "system",
    language: locale,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * 准备用户档案数据
 * @param username 用户名
 * @param email 邮箱
 * @returns 用户档案数据
 */
function prepareUserProfile(
  username: string,
  email: string
): Record<string, any> {
  return {
    nickname: username,
    avatar: "",
    bio: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    email,
  };
}

/**
 * 保存用户数据到数据库（批量操作）
 * @param userId 用户ID
 * @param userData 用户基础数据
 * @param userSettings 用户设置数据
 * @param userProfile 用户档案数据
 */
async function saveUserDataToDb(
  userId: string,
  userData: Record<string, any>,
  userSettings: Record<string, any>,
  userProfile: Record<string, any>
): Promise<void> {
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

/**
 * 生成签名消息并加密
 * @param username 用户名
 * @param userId 用户ID
 * @param publicKey 公钥
 * @returns 加密后的数据或错误响应
 */
function signUserMessage(
  username: string,
  userId: string,
  publicKey: string
): string | Response {
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

/**
 * 处理用户注册请求
 * @param req 请求对象
 * @returns 注册结果
 */
export async function handleSignUp(req: any): Promise<Response> {
  try {
    // 检查请求方法
    const methodValidation = validateRequestMethod(req.method);
    if (methodValidation) return methodValidation;

    // 提取用户数据
    const userDataResult = extractUserData(req.body);
    if (userDataResult instanceof Response) return userDataResult;
    const { username, publicKey, locale, email } = userDataResult;

    // 生成用户ID
    const userId = generateUserId(publicKey, username, locale);

    // 检查用户是否存在
    const userExistsResult = await checkUserExists(userId);
    if (userExistsResult) return userExistsResult;

    // 准备用户数据
    const userData = prepareUserData(userDataResult);
    const userSettings = prepareUserSettings(locale);
    const userProfile = prepareUserProfile(username, email);

    // 保存数据到数据库
    await saveUserDataToDb(userId, userData, userSettings, userProfile);

    // 签名并加密消息
    const encryptedDataResult = signUserMessage(username, userId, publicKey);
    if (encryptedDataResult instanceof Response) return encryptedDataResult;
    const encryptedData = encryptedDataResult;

    // 返回成功响应
    return createSuccessResponse({ encryptedData });
  } catch (error) {
    console.error("Signup error:", error);
    return createErrorResponse("Internal server error", 500);
  }
}
