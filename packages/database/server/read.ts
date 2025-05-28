// src/server/handlers/read.ts
import serverDb from "./db";

export const handleReadSingle = async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (!req.params.id) {
    return new Response(JSON.stringify({ error: "need id" }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  const dbKey = req.params.id;
  try {
    const result = await serverDb.get(dbKey);
    if (!result) {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: `Resource with id ${dbKey} not found`,
        }),
        { status: 404, headers: corsHeaders }
      );
    }

    return new Response(JSON.stringify({ ...result }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Database fetch error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Failed to fetch data",
      }),
      { status: 500, headers: corsHeaders }
    );
  }
};
