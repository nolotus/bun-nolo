// auth/server/locks.ts
import { Mutex } from "async-mutex";

export class BalanceLockManager {
  private static instance: BalanceLockManager;
  private locks = new Map<string, Mutex>();

  private constructor() {}

  public static getInstance(): BalanceLockManager {
    if (!BalanceLockManager.instance) {
      BalanceLockManager.instance = new BalanceLockManager();
    }
    return BalanceLockManager.instance;
  }

  public getLock(userId: string): Mutex {
    let lock = this.locks.get(userId);
    if (!lock) {
      lock = new Mutex();
      this.locks.set(userId, lock);
    }
    return lock;
  }

  // 可选:清理长时间未使用的锁
  public cleanupLocks(inactiveMs: number = 30 * 60 * 1000) {
    // ... 清理逻辑
  }
}

export const balanceLockManager = BalanceLockManager.getInstance();
