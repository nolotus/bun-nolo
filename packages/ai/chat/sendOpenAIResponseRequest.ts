import {
  addActiveController,
  removeActiveController,
} from "chat/dialog/dialogSlice";
import { messageStreaming, messageStreamEnd } from "chat/messages/messageSlice";
import { selectCurrentServer } from "app/settings/settingSlice";
import { getApiEndpoint } from "ai/llm/providers";
import { createDialogMessageKeyAndId } from "database/keys";
import { selectCurrentToken } from "auth/authSlice";
import { extractCustomId } from "core/prefix";
import { performFetchRequest } from "./fetchUtils";
import { parseMultilineSSE } from "./parseMultilineSSE";
import { parseApiError } from "./parseApiError";
import { updateTotalUsage } from "./updateTotalUsage";
import { toolRegistry } from "../tools/toolRegistry";

type Segment = { type: "text"; text: string };
const seg = (txt: string): Segment[] => [{ type: "text", text: txt ?? "" }];

const safeCancel = async (
  r?: ReadableStreamDefaultReader<Uint8Array>
): Promise<void> => {
  if (!r) return;
  try {
    await r.cancel();
  } catch {
    /* noop */
  }
};

const prepareTools = (ns: string[]) =>
  ns.map((n) => toolRegistry[n]).filter(Boolean);

export const sendOpenAIResponseRequest = async ({
  bodyData,
  agentConfig: cybotConfig,
  thunkApi,
  dialogKey,
  parentMessageId,
  debug = false,
}: {
  bodyData: any;
  agentConfig: any;
  thunkApi: any;
  dialogKey: string;
  parentMessageId?: string;
  debug?: boolean;
}): Promise<string> => {
  /* ---------------- log util ---------------- */
  const logs: string[] = [];
  const log = (m: string, level: "debug" | "error" = "debug") => {
    logs.push(m);
    if (debug) {
      (level === "error" ? console.error : console.debug)(m);
    }
  };

  /* ---------------- common ---------------- */
  const { dispatch, getState, signal: thunkSignal } = thunkApi;
  const dialogId = extractCustomId(dialogKey);

  const controller = new AbortController();
  thunkSignal.addEventListener("abort", () => controller.abort());
  const signal = controller.signal;

  const ids =
    parentMessageId != null
      ? {
          messageId: parentMessageId,
          key: `msg:${dialogId}:${parentMessageId}`,
        }
      : createDialogMessageKeyAndId(dialogId);
  const { messageId, key: msgKey } = ids;

  log(`[INIT] msgId=${messageId} key=${msgKey}`);

  dispatch(addActiveController({ messageId, controller }));
  dispatch(
    messageStreaming({
      id: messageId,
      dbKey: msgKey,
      content: "",
      thinkContent: "",
      role: "assistant",
      cybotKey: cybotConfig.dbKey,
      isStreaming: true,
    })
  );

  if (Array.isArray(cybotConfig.tools) && cybotConfig.tools.length) {
    bodyData.tools = prepareTools(cybotConfig.tools);
    log(`[TOOLS] ${JSON.stringify(cybotConfig.tools)}`);
  }
  bodyData.stream ??= true;

  /* ---------------- buffers ---------------- */
  let contentStr = "";
  let reasoningBuf = "";
  let summaryBuf = "";
  let totalUsage: any = null;
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;

  /* ---- throttled streaming ---- */
  let timer: ReturnType<typeof setTimeout> | null = null;
  const flush = () => {
    timer = null;
    dispatch(
      messageStreaming({
        id: messageId,
        dbKey: msgKey,
        content: seg(contentStr),
        thinkContent: reasoningBuf,
        role: "assistant",
        cybotKey: cybotConfig.dbKey,
      })
    );
    log(`[DISPATCH] messageStreaming`);
  };
  const schedule = () => (timer ??= setTimeout(flush, 50));

  /* ---- once-finalize ---- */
  const finalize = (() => {
    let done = false;
    return (): string => {
      if (done) return debug ? logs.join("\n") : "";
      done = true;

      if (timer) {
        clearTimeout(timer);
        flush();
      }

      dispatch(
        messageStreamEnd({
          finalContentBuffer: seg(contentStr),
          totalUsage,
          msgKey,
          cybotConfig,
          dialogId,
          dialogKey,
          messageId,
          reasoningBuffer: reasoningBuf,
        })
      );
      log(`[ACTION] messageStreamEnd`);
      return debug ? logs.join("\n") : "";
    };
  })();

  /* ---------------- SSE handlers ---------------- */
  type Event = any; // 可进一步在其它文件声明联合类型 (#6)
  const handlers: Record<
    string,
    (e: Event) => Promise<"continue" | "finalize">
  > = {
    "response.output_text.delta": async (e) => {
      if (e.delta) {
        contentStr += e.delta;
        schedule();
      }
      return "continue";
    },
    "response.failed": async (e) => {
      contentStr += `\n[API Failed: ${
        e.response?.error?.message || "unknown"
      }]`;
      return "finalize";
    },
    "response.incomplete": async (e) => {
      contentStr += `\n[Incomplete: ${
        e.response?.incomplete_details?.reason || "unknown"
      }]`;
      return "finalize";
    },
    "response.completed": async () => "finalize",
    "response.reasoning.delta": async (e) => {
      if (e.delta?.text) reasoningBuf += e.delta.text;
      return "continue";
    },
    "response.reasoning.done": async (e) => {
      if (e.text) reasoningBuf += e.text;
      return "continue";
    },
    "response.reasoning_summary.delta": async (e) => {
      if (e.delta?.text) summaryBuf += e.delta.text;
      return "continue";
    },
    "response.reasoning_summary.done": async (e) => {
      if (e.text) summaryBuf += e.text;
      return "continue";
    },
    // 跳过型事件
    "response.queued": async () => "continue",
    "response.in_progress": async () => "continue",
    "response.created": async () => "continue",
    "response.output_item.added": async () => "continue",
    "response.content_part.added": async () => "continue",
    "response.output_text.done": async () => "continue",
    "response.content_part.done": async () => "continue",
    "response.output_item.done": async () => "continue",
  };
  const defaultHandler = async (e: Event) => {
    log(`[WARN] unknown type ${e.type}`);
    return "continue";
  };

  /* ---------------- fetch & stream ---------------- */
  try {
    const api = getApiEndpoint(cybotConfig);
    const token = selectCurrentToken(getState());
    log(`[FETCH] POST ${api}`);

    const resp = await performFetchRequest({
      cybotConfig,
      api,
      bodyData,
      currentServer: selectCurrentServer(getState()),
      signal,
      token,
    });

    if (!resp.ok) {
      const err = await parseApiError(resp);
      log(`[HTTP ${resp.status}] ${err}`, "error");
      contentStr += `[错误: ${err}]`;
      return finalize();
    }

    reader = resp.body?.getReader();
    if (!reader) return finalize();

    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });

      const eventsArr = parseMultilineSSE(chunk);
      const events = Array.isArray(eventsArr) ? eventsArr : [eventsArr];

      for (const e of events) {
        if (e.usage) totalUsage = updateTotalUsage(totalUsage, e.usage);

        if (e.type === "error") {
          contentStr += `\n[Error: ${e.message || "Unknown"}]`;
          await safeCancel(reader);
          return finalize();
        }

        const res = await (handlers[e.type] ?? defaultHandler)(e);
        if (res === "finalize") {
          await safeCancel(reader);
          return finalize();
        }
      }
    }

    return finalize();
  } catch (err: any) {
    const msg =
      err?.name === "AbortError" ? "[用户中断]" : `[异常: ${err?.message}]`;
    contentStr += msg;
    return finalize();
  } finally {
    dispatch(removeActiveController(messageId));
    await safeCancel(reader);
  }
};
