// /handlers/apifyActorHandler.ts

const APIFY_TOKEN = process.env.APIFY_TOKEN;

type ResultType = "datasetItems" | "run" | "kvOutput";

interface ApifyActorRequestBody {
  actorId: string; // 如 "apify~website-content-crawler" / "streamers~youtube-scraper"
  input: any; // 直接传给 Apify 的 inputSchema
  resultType?: ResultType; // 默认 "datasetItems"
}

export async function handleApifyActor(req: Request): Promise<Response> {
  try {
    const body = (await req
      .json()
      .catch(() => null)) as ApifyActorRequestBody | null;

    if (!body || typeof body !== "object") {
      return jsonError(
        400,
        "请求体必须是 JSON 对象，并包含 actorId 与 input 字段。"
      );
    }

    const { actorId, input, resultType = "datasetItems" } = body;

    if (!actorId || typeof actorId !== "string") {
      return jsonError(400, "缺少有效的 actorId（字符串）。");
    }
    if (!input || typeof input !== "object") {
      return jsonError(400, "缺少有效的 input（对象）。");
    }

    if (!APIFY_TOKEN) {
      return jsonError(
        500,
        "后端未配置 APIFY_TOKEN 环境变量，无法调用 Apify API。"
      );
    }

    // 支持传 "apify~xxx" 或 "apify/xxx"，统一转为 path 里的形式
    const normalizedActorId = actorId.replace("/", "~");

    let suffix: string;
    switch (resultType) {
      case "run":
        suffix = "runs";
        break;
      case "kvOutput":
        suffix = "run-sync";
        break;
      case "datasetItems":
      default:
        suffix = "run-sync-get-dataset-items";
        break;
    }

    const url = `https://api.apify.com/v2/acts/${encodeURIComponent(
      normalizedActorId
    )}/${suffix}?token=${APIFY_TOKEN}`;

    const apifyResp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const text = await apifyResp.text();
    let parsed: any = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      // 不是 JSON 就直接原样转发
    }

    if (!apifyResp.ok) {
      console.error("Apify 调用失败:", apifyResp.status, text);
      return new Response(
        JSON.stringify({
          error: "调用 Apify Actor 失败",
          status: apifyResp.status,
          detail: parsed,
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("handleApifyActor 发生异常:", err);
    return jsonError(500, `服务器内部错误: ${err?.message || String(err)}`);
  }
}

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
