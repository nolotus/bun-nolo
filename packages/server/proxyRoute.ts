import { omit } from "rambda";

export const proxyRoute = async (req, res) => {
  try {
    const rawBody = req.body;
    console.log("rawBody", rawBody);
    console.log("rawBody.KEY");

    const body = omit("url,KEY", rawBody);

    const headers = rawBody.model.includes("claude")
      ? {
          "Content-Type": "application/json",
          "x-api-key": rawBody.KEY,
          "anthropic-version": "2023-06-01",
        }
      : {
          "Content-Type": "application/json",
          Authorization: `Bearer ${rawBody.KEY}`,
        };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const { readable, writable } = new TransformStream();

    fetch(rawBody.url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Status ${response.status}: ${errorText}`);
        }
        return response.body.pipeTo(writable);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        writable.abort(error);
        return new Response(
          JSON.stringify({
            error: error.message,
            code: error.message.includes("Status 400") ? 400 : 500,
          }),
          {
            status: error.message.includes("Status 400") ? 400 : 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      })
      .finally(() => {
        clearTimeout(timeout);
      });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        code: error.message.includes("Status 400") ? 400 : 500,
      }),
      {
        status: error.message.includes("Status 400") ? 400 : 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
};
