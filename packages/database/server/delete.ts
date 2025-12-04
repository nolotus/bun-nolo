// server/handlers/delete.ts
import serverDb from "./db";
import { deleteMessages } from "chat/messages/server/deleteMessages";
import { nolotusId } from "core/init";
import { handleToken } from "auth/server/token";

type DeleteRequest = Request & {
  // 视你的路由库而定，这里假定有 params.id
  params: {
    id: string;
  };
};

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

const canDeleteCybotPubData = (id: string, actionUserId?: string): boolean => {
  const isCybotPubData = id.startsWith("cybot-pub");
  const isNolotusUser = actionUserId === nolotusId;
  return isCybotPubData && isNolotusUser;
};

export const handleDelete = async (req: DeleteRequest) => {
  try {
    const user = await handleToken(req, {});
    const actionUserId = user?.userId;

    const { id } = req.params;
    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    // 1. 删除消息的专用分支
    if (type === "messages") {
      const result = await deleteMessages(id);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: CORS_HEADERS,
      });
    }

    // 2. 删除通用数据
    const data = await serverDb.get(id);
    const ownerId = data?.userId as string | undefined;

    const ownerMissing = ownerId == null; // 替代 isNil
    const isOwner = ownerId === actionUserId;
    const allowCybotPubDelete = canDeleteCybotPubData(id, actionUserId);

    if (ownerMissing || isOwner || allowCybotPubDelete) {
      if (data) {
        await serverDb.del(id);
      }

      return new Response(
        JSON.stringify({
          message: "Delete request processed",
          processingIds: [id],
        }),
        {
          status: 200,
          headers: CORS_HEADERS,
        }
      );
    }

    // 3. 无权限
    return new Response(
      JSON.stringify({
        error: "Unauthorized action",
        ownerId,
        actionUserId,
        processingIds: [],
      }),
      {
        status: 403,
        headers: CORS_HEADERS,
      }
    );
  } catch (error) {
    console.error("Delete handler error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        processingIds: [],
      }),
      {
        status: 500,
        headers: CORS_HEADERS,
      }
    );
  }
};
