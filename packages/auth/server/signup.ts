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

export async function handleSignUp(req) {
  if (req.method === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    const { username, publicKey, locale, email } = req.body;

    const userId = generateUserIdV1(publicKey, username, locale);

    // 检查用户是否存在
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

    // 准备用户基础数据
    const userData = reject((x) => x === null || x === undefined, {
      username,
      publicKey,
      locale,
      createdAt: Date.now(),
      email,
      balance: 1,
      balanceUpdatedAt: Date.now(),
    });

    // 准备用户设置数据（移除defaultSpaceId）
    const userSettings = {
      theme: "system",
      language: locale,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // 准备用户档案数据
    const userProfile = {
      nickname: username,
      avatar: "",
      bio: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      email,
    };

    try {
      // 使用batch操作保存数据（移除space相关数据）
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

      const message = JSON.stringify({
        username,
        userId,
        publicKey,
      });

      const secretKey = process.env.SECRET_KEY;
      if (!secretKey) {
        return createErrorResponse(t("errors.secretKeyMissing"), 500);
      }

      const encryptedData = signMessage(message, secretKey);

      return createSuccessResponse({ encryptedData });
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error("Signup error:", error);
    return createErrorResponse("Internal server error");
  }
}
