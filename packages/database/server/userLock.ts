// 创建一个用户锁映射
const userLocks = new Map<string, Promise<void>>();

// 使用锁执行操作
export async function withUserLock<T>(
  userId: string,
  operation: () => Promise<T>,
): Promise<T> {
  // 等待之前的锁（如果有的话）
  const prevLock = userLocks.get(userId);
  if (prevLock) {
    await prevLock;
  }

  // 创建新的锁
  let resolve: () => void;
  const newLock = new Promise<void>((res) => {
    resolve = res;
  });

  userLocks.set(userId, newLock);

  try {
    // 执行操作
    return await operation();
  } finally {
    // 释放锁
    resolve!();
    if (userLocks.get(userId) === newLock) {
      userLocks.delete(userId);
    }
  }
}
