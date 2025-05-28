// src/server/handlers/delete.ts
import { isNil } from "rambda";
import serverDb from "./db";
import { deleteMessages } from "chat/messages/server/deleteMessages";
import { nolotusId } from "core/init";
import { handleToken } from "auth/server/token";

const canDeleteCybotPubData = (id: string, actionUserId: string): boolean => {
  const isCybotPubData = id.startsWith("cybot-pub");
  const isNolotusUser = actionUserId === nolotusId;
  return isCybotPubData && isNolotusUser;
};

export const handleDelete = async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const user = await handleToken(req, {});
    const actionUserId = user?.userId;
    const { id } = req.params;
    const type = new URL(req.url).searchParams.get("type");

    if (type === "messages") {
      const result = await deleteMessages(id);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: corsHeaders,
      });
    }

    const data = await serverDb.get(id);
    const ownerId = data?.userId;

    if (
      isNil(ownerId) ||
      ownerId === actionUserId ||
      canDeleteCybotPubData(id, actionUserId)
    ) {
      if (data) {
        await serverDb.del(id);
      }

      return new Response(
        JSON.stringify({
          message: "Delete request processed",
          processingIds: [id],
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Unauthorized action",
        ownerId,
        actionUserId,
        processingIds: [],
      }),
      { status: 403, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Delete handler error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        processingIds: [],
      }),
      { status: 500, headers: corsHeaders }
    );
  }
};
