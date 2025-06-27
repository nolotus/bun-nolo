import { chromium, Browser, Page, LaunchOptions } from "playwright";

// 定义会话对象结构，包含Page实例和创建时间戳
interface BrowserSession {
  page: Page;
  createdAt: number;
}

// 使用Map来存储所有活跃的会ushijian，key为sessionId
const activeSessions = new Map<string, BrowserSession>();
let browserInstance: Browser | null = null;
const SESSION_TIMEOUT_MS = 10 * 60 * 1000; // 会话10分钟无操作则自动超时

/**
 * 确保浏览器实例已启动 (单例模式，提高性能)
 */
async function ensureBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    console.log("启动共享浏览器实例...");
    const launchOptions: LaunchOptions = {
      // 在生产/Docker环境中，通常需要以下参数
      // args: ['--no-sandbox', '--disable-setuid-sandbox']
    };
    browserInstance = await chromium.launch(launchOptions);
    // 确保程序退出时浏览器能被关闭
    process.on("exit", () => browserInstance?.close());
  }
  return browserInstance;
}

/**
 * 创建一个新的浏览器会话。
 * @param url - 初始导航的URL。
 * @returns 返回包含新会话ID的对象。
 */
export async function createSession(
  url: string
): Promise<{ sessionId: string }> {
  const browser = await ensureBrowser();
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

  const sessionId = `session_${Date.now()}`;
  activeSessions.set(sessionId, { page, createdAt: Date.now() });

  console.log(`浏览器会话已创建: ${sessionId}，目标: ${url}`);
  return { sessionId };
}

/**
 * 根据ID获取一个活跃的会话Page对象。
 * @param sessionId - 会话ID。
 * @returns 返回Playwright的Page对象。
 */
export function getSessionPage(sessionId: string): Page {
  const session = activeSessions.get(sessionId);
  if (!session) {
    throw new Error(
      `会话无效或已过期: ${sessionId}。请先使用 browser_openSession 创建会话。`
    );
  }
  // 每次访问都“续期”，防止被自动清理
  session.createdAt = Date.now();
  return session.page;
}

/**
 * 定期清理过期的空闲会话，防止资源泄露。
 */
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of activeSessions.entries()) {
    if (now - session.createdAt > SESSION_TIMEOUT_MS) {
      console.log(`会话 ${sessionId} 超时，正在关闭...`);
      session.page
        .context()
        .close()
        .catch((e) => console.error(`关闭超时会话 ${sessionId} 失败:`, e));
      activeSessions.delete(sessionId);
    }
  }
}, 60 * 1000); // 每分钟检查一次
