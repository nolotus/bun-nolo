// auth/server/utils.ts
import { logger } from "./shared";

interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

interface RetryError extends Error {
  attempts?: number;
  lastError?: Error;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  delayMs: 1000,
  backoff: true,
  onRetry: (attempt, error) => {
    logger.warn({
      event: "operation_retry",
      attempt,
      error: error.message,
    });
  },
};

/**
 * 通用重试函数
 * @param operation 需要重试的异步操作
 * @param options 重试配置选项
 * @returns 操作结果
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const finalOptions = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= finalOptions.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt === finalOptions.maxAttempts) {
        break;
      }

      const delay = finalOptions.backoff
        ? finalOptions.delayMs * Math.pow(2, attempt - 1)
        : finalOptions.delayMs;

      if (finalOptions.onRetry) {
        finalOptions.onRetry(attempt, lastError);
      }

      await sleep(delay);
    }
  }

  const error: RetryError = new Error(
    `Operation failed after ${finalOptions.maxAttempts} attempts`
  );
  error.attempts = finalOptions.maxAttempts;
  error.lastError = lastError || undefined;
  throw error;
}

/**
 * 带超时的重试函数
 */
export async function withRetryAndTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  options?: Partial<RetryOptions>
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([withRetry(operation, options), timeoutPromise]);
}

/**
 * 休眠函数
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 带重试的批量操作
 */
export async function withBatchRetry<T>(
  operations: (() => Promise<T>)[],
  options?: Partial<RetryOptions>
): Promise<T[]> {
  return Promise.all(
    operations.map((operation) => withRetry(operation, options))
  );
}

/**
 * 用法示例:
 */
/* 
// 基本用法
try {
  const result = await withRetry(
    async () => {
      // 异步操作
      return await someAsyncOperation();
    },
    {
      maxAttempts: 3,
      delayMs: 1000,
      backoff: true,
    }
  );
} catch (error) {
  // 处理最终失败
}

// 带超时的用法
try {
  const result = await withRetryAndTimeout(
    async () => {
      return await someAsyncOperation();
    },
    5000, // 5秒超时
    {
      maxAttempts: 3,
      delayMs: 1000,
    }
  );
} catch (error) {
  // 处理超时或重试失败
}

// 自定义重试回调
const result = await withRetry(
  async () => {
    return await someAsyncOperation();
  },
  {
    onRetry: (attempt, error) => {
      logger.warn({
        event: "custom_retry",
        attempt,
        error: error.message,
        customData: "some context",
      });
    },
  }
);
*/

/**
 * 测试用例
 */
/* 
describe("withRetry", () => {
  it("should retry failed operations", async () => {
    let attempts = 0;
    const operation = async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error("Temporary failure");
      }
      return "success";
    };

    const result = await withRetry(operation, {
      maxAttempts: 3,
      delayMs: 100,
    });

    expect(result).toBe("success");
    expect(attempts).toBe(3);
  });

  it("should fail after max attempts", async () => {
    const operation = async () => {
      throw new Error("Persistent failure");
    };

    await expect(
      withRetry(operation, {
        maxAttempts: 3,
        delayMs: 100,
      })
    ).rejects.toThrow("Operation failed after 3 attempts");
  });
});
*/
