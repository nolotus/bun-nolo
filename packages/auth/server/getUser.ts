import { nolotusId } from "core/init";
import serverDb, { DB_PREFIX } from "database/server/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

type UserData = {
  id: string;
  username: string;
  email?: string;
  balance?: number;
  createdAt: string;
  [key: string]: any;
};

const canViewUserProfile = (requestUserId: string, targetUserId: string) => {
  const isAdmin = requestUserId === nolotusId;
  const isOwnProfile = requestUserId === targetUserId;

  return isAdmin || isOwnProfile;
};

export async function handleGetUser(req: Request, userId: string) {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    // @ts-ignore req.user comes from middleware
    if (!canViewUserProfile(req.user.userId, userId)) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Insufficient permissions" }),
        { status: 403, headers: CORS_HEADERS }
      );
    }

    const user = await getUser(userId);

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: CORS_HEADERS,
      });
    }

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (error) {
    console.log({
      level: "error",
      event: "get_user_error",
      userId,
      error: error instanceof Error ? error.message : String(error),
    });

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

async function getUser(userId: string): Promise<UserData | null> {
  const key = `${DB_PREFIX.USER}${userId}`;

  try {
    const userData = await serverDb.get(key);

    if (!userData) return null;

    return {
      id: userId,
      username: userData.username,
      email: userData.email || "",
      balance: userData.balance || 0,
      createdAt: userData.createdAt,
      ...userData,
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch user: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
