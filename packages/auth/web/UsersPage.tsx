// pages/UsersPage.tsx
import { useCallback, useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTheme } from "app/theme";
import { useAppSelector } from "app/store";
import { selectCurrentServer } from "app/settings/settingSlice";
import Button from "render/web/ui/Button";
import Pagination from "render/web/ui/Pagination";
import { useDeleteUser } from "auth/hooks/useDeleteUser";
import { useRechargeUser } from "auth/hooks/useRechargeUser";
import { Table, TableRow, TableCell } from "render/web/ui/Table";
import { ConfirmModal } from "render/web/ui/ConfirmModal";
import { RechargeModal } from "life/web/RechargeModal";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import pino from "pino";
import { useFetchUsers } from "auth/hooks/useFetchUsers";
import { useDisableUser } from "auth/hooks/useDisableUser";
import { useEnableUser } from "auth/hooks/useEnableUser";

const logger = pino({ name: "UsersPage" });
const PAGE_SIZE = 10;

interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  createdAt: string;
  lastLoginAt: string | null;
  isDisabled?: boolean;
}

type ActionType = "delete" | "disable" | "enable";

export default function UsersPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams(); // 修改：支持 setSearchParams
  const currentServer = useAppSelector(selectCurrentServer);

  // 搜索状态：本地输入值（用于输入框），从 URL 同步
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );

  // 列表状态
  const [state, setState] = useState({
    users: [] as User[],
    loading: false,
    error: null as string | null,
    currentPage: parseInt(searchParams.get("page") || "1", 10),
    total: 0,
    totalPages: 0,
  });
  const { users, loading, error, currentPage, total } = state;

  // 获取用户列表（修改：支持 search 参数）
  const fetchUsers = useFetchUsers();
  const handleFetch = useCallback(
    async (page: number, search?: string) => {
      // 修改：添加 search 参数
      if (!currentServer) {
        logger.debug("No server selected, skipping fetch");
        return;
      }
      logger.debug({ page, search }, "Fetching users");
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        // 注意：这里假设 useFetchUsers 已修改支持 search 参数（如 url.searchParams.append("search", search || "")）
        // 如果 hook 未更新，你需要在 hook 中添加 search 支持（见文末说明）
        const data = await fetchUsers(page, search); // 修改：传递 search
        if (!data?.list) {
          logger.warn("No data returned from fetchUsers");
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "无法获取数据",
            users: [],
          }));
          return;
        }
        logger.debug(
          { userCount: data.list.length, total: data.total },
          "Users fetched successfully"
        );
        setState((prev) => ({
          ...prev,
          users: data.list,
          currentPage: page,
          total: data.total,
          totalPages: data.totalPages,
          loading: false,
        }));
      } catch (err) {
        logger.error({ err }, "Failed to fetch users");
        setState((prev) => ({
          ...prev,
          error: "加载用户失败，请重试",
          loading: false,
          users: [],
        }));
      }
    },
    [fetchUsers, currentServer]
  );

  useEffect(() => {
    if (currentServer) {
      const page = parseInt(searchParams.get("page") || "1", 10);
      const search = searchParams.get("search") || undefined;
      handleFetch(page, search); // 修改：传递 search
    }
  }, [currentServer, handleFetch, searchParams]); // searchParams 变化会触发

  // 搜索提交：更新 URL，重置到第1页
  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedSearch = searchInput.trim();
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          if (trimmedSearch) {
            newParams.set("search", trimmedSearch);
          } else {
            newParams.delete("search");
          }
          newParams.set("page", "1"); // 重置到第1页
          return newParams;
        },
        { replace: true } // 不添加历史记录
      );
      setSearchInput(trimmedSearch); // 更新本地输入
      logger.debug({ search: trimmedSearch }, "Search submitted");
    },
    [searchInput, setSearchParams]
  );

  // 清空搜索
  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("search");
        newParams.set("page", "1");
        return newParams;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  // 统一确认模态框状态
  const [confirmModal, setConfirmModal] = useState<{
    type?: ActionType;
    user?: User;
  }>({});
  const [confirmLoading, setConfirmLoading] = useState(false);

  // 操作成功后刷新
  const handleActionSuccess = useCallback(() => {
    const search = searchParams.get("search") || undefined;
    handleFetch(currentPage, search); // 修改：保持搜索条件
  }, [currentPage, handleFetch, searchParams]);

  // 钩子：删除/停用/启用
  const deleteUser = useDeleteUser(handleActionSuccess);
  const disableUser = useDisableUser(handleActionSuccess);
  const enableUser = useEnableUser(handleActionSuccess);

  // 操作配置表
  const confirmActions = useMemo(
    () => ({
      delete: {
        title: "删除用户",
        type: "error" as const,
        getMessage: (u: string) => `确定要删除用户「${u}」吗？此操作无法撤销。`,
        handler: deleteUser,
      },
      disable: {
        title: "停用用户",
        type: "warning" as const,
        getMessage: (u: string) =>
          `确定要停用用户「${u}」吗？停用后用户将无法登录。`,
        handler: disableUser,
      },
      enable: {
        title: "启用用户",
        type: "success" as const,
        getMessage: (u: string) =>
          `确定要启用用户「${u}」吗？启用后用户将恢复登录权限。`,
        handler: enableUser,
      },
    }),
    [deleteUser, disableUser, enableUser]
  );

  // 充值模态框状态
  const [rechargeModal, setRechargeModal] = useState({
    isOpen: false,
    userId: "",
    username: "",
  });
  const rechargeUser = useRechargeUser(() => {
    const search = searchParams.get("search") || undefined; // 修改：保持搜索
    handleFetch(currentPage, search);
  });
  const handleRechargeClick = useCallback((user: User) => {
    setRechargeModal({
      isOpen: true,
      userId: user.id,
      username: user.username,
    });
  }, []);
  const handleRechargeConfirm = useCallback(
    async (amount: number) => {
      try {
        await rechargeUser(rechargeModal.userId, amount);
        logger.debug(
          { userId: rechargeModal.userId, amount },
          "Recharge success"
        );
      } catch (err) {
        logger.error({ err }, "Recharge failed");
        throw err;
      }
    },
    [rechargeModal.userId, rechargeUser]
  );

  // 分页
  const handlePageChange = useCallback(
    (newPage: number) => {
      logger.debug({ from: currentPage, to: newPage }, "Page change requested");
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set("page", newPage.toString());
          return newParams;
        },
        { replace: true }
      );
    },
    [setSearchParams, currentPage]
  );

  // 时间格式化
  const formatTime = (time: string | null) => {
    if (!time) return "-";
    return formatDistanceToNow(new Date(time), {
      addSuffix: true,
      locale: zhCN,
    });
  };

  // 新增：发送邮件
  const handleSendEmail = useCallback((email: string) => {
    if (!email) {
      alert("邮箱地址不存在");
      return;
    }
    window.location.href = `mailto:${email}`;
  }, []);

  if (!currentServer) {
    return <div className="no-server">请先选择服务器以查看用户列表</div>;
  }

  return (
    <div className="users-page">
      <header className="page-header">
        <h1 className="page-title">用户列表</h1>
        {/* 新增：搜索框区域 */}
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="搜索用户名、ID 或邮箱..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-input"
            />
            <Button
              type="submit"
              variant="primary"
              size="small"
              className="search-button"
            >
              搜索
            </Button>
            {searchInput && (
              <Button
                type="button"
                onClick={handleClearSearch}
                variant="secondary"
                size="small"
                className="clear-button"
              >
                清空
              </Button>
            )}
          </div>
        </form>
        <div className="header-actions">{/* 预留后续可能的功能按钮 */}</div>
      </header>

      {error && (
        <div className="error-container">
          <span className="error-message">{error}</span>
          <Button
            onClick={() => {
              const search = searchParams.get("search") || undefined;
              handleFetch(currentPage, search);
            }}
            variant="secondary"
            size="small"
          >
            重试
          </Button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <Button loading variant="primary">
            加载中
          </Button>
        </div>
      ) : users.length > 0 ? (
        <>
          <div className="table-container">
            <Table>
              <thead>
                <TableRow>
                  <TableCell element={{ header: true }}>用户名</TableCell>
                  <TableCell element={{ header: true }}>邮箱</TableCell>
                  <TableCell element={{ header: true }}>余额</TableCell>
                  <TableCell element={{ header: true }}>注册时间</TableCell>
                  <TableCell element={{ header: true }}>最近登录</TableCell>
                  <TableCell element={{ header: true }} align="right">
                    操作
                  </TableCell>
                </TableRow>
              </thead>
              <tbody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell element={{}}>
                      {user.username}
                      {user.isDisabled && (
                        <span style={{ color: theme.error, marginLeft: "8px" }}>
                          (已停用)
                        </span>
                      )}
                    </TableCell>
                    <TableCell element={{}}>{user.email || "-"}</TableCell>
                    <TableCell element={{}}>
                      ¥ {user.balance.toFixed(2)}
                    </TableCell>
                    <TableCell element={{}}>
                      {formatTime(user.createdAt)}
                    </TableCell>
                    <TableCell element={{}}>
                      {formatTime(user.lastLoginAt)}
                    </TableCell>
                    <TableCell element={{}} align="right">
                      <div className="action-buttons">
                        <Button
                          onClick={() => handleRechargeClick(user)}
                          variant="primary"
                          size="small"
                        >
                          充值
                        </Button>

                        {user.isDisabled ? (
                          <Button
                            onClick={() =>
                              setConfirmModal({ type: "enable", user })
                            }
                            variant="secondary"
                            status="success"
                            size="small"
                          >
                            启用
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={() =>
                                setConfirmModal({ type: "disable", user })
                              }
                              variant="secondary"
                              status="warning"
                              size="small"
                            >
                              停用
                            </Button>
                            <Button
                              onClick={() => handleSendEmail(user.email)}
                              variant="secondary"
                              size="small"
                            >
                              发送邮件
                            </Button>
                          </>
                        )}

                        <Button
                          onClick={() =>
                            setConfirmModal({ type: "delete", user })
                          }
                          status="error"
                          size="small"
                        >
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>

          <footer className="page-footer">
            <Pagination
              currentPage={currentPage}
              totalItems={total}
              pageSize={PAGE_SIZE}
              onPageChange={handlePageChange}
            />
            <div className="total-info">共 {total} 个用户</div>
          </footer>
        </>
      ) : (
        <div className="empty-container">
          <div className="empty-content">
            {searchInput
              ? `未找到与「${searchInput}」匹配的用户`
              : "暂无用户数据"}
          </div>
        </div>
      )}

      {/* 统一的 ConfirmModal */}
      {confirmModal.type && confirmModal.user && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setConfirmModal({})}
          onConfirm={async () => {
            setConfirmLoading(true);
            const action = confirmActions[confirmModal.type!];
            try {
              await action.handler(confirmModal.user!.id);
              setConfirmModal({});
            } catch {
              alert(`${action.title}失败，请重试`);
            } finally {
              setConfirmLoading(false);
            }
          }}
          title={confirmActions[confirmModal.type].title}
          message={confirmActions[confirmModal.type].getMessage(
            confirmModal.user.username
          )}
          type={confirmActions[confirmModal.type].type}
          loading={confirmLoading}
        />
      )}

      <RechargeModal
        isOpen={rechargeModal.isOpen}
        onClose={() =>
          setRechargeModal({ isOpen: false, userId: "", username: "" })
        }
        onConfirm={handleRechargeConfirm}
        username={rechargeModal.username}
      />

      <style href="users-page" precedence="default">{`
  .users-page {
    padding: 24px;
    min-height: calc(100dvh - 60px);
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }

  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--text); /* 替换 theme.text */
    margin: 0;
    flex: 1;
    min-width: 200px;
  }

  .search-form {
    display: flex;
    flex: 1;
    max-width: 400px;
    min-width: 200px;
  }

  .search-input-wrapper {
    display: flex;
    gap: 8px;
    width: 100%;
    align-items: center;
  }

  .search-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid var(--border); /* 替换 theme.border */
    border-radius: 6px;
    background: var(--background); /* 替换 theme.background */
    color: var(--text); /* 替换 theme.text */
    font-size: 14px;
    outline: none;
  }

  .search-input:focus {
    border-color: var(--primary); /* 替换 theme.primary */
    box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1); /* 假设有 primary-rgb */
  }

  .search-button, .clear-button {
    white-space: nowrap;
    min-width: 60px;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }

  .error-container {
    padding: 12px 16px;
    background: var(--backgroundSecondary); /* 替换 theme.backgroundSecondary */
    border: 1px solid var(--error); /* 替换 theme.error */
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .error-message {
    color: var(--error); /* 替换 theme.error */
  }

  .loading-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }

  .table-container {
    flex: 1;
    overflow: auto;
    border-radius: 8px;
    background: var(--background); /* 替换 theme.background */
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .page-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-top: 16px;
  }

  .total-info {
    font-size: 14px;
    color: var(--textSecondary); /* 替换 theme.textSecondary */
  }

  .empty-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    background: var(--backgroundSecondary); /* 替换 theme.backgroundSecondary */
    border-radius: 8px;
    border: 1px dashed var(--border); /* 替换 theme.border */
  }

  .empty-content {
    color: var(--textSecondary); /* 替换 theme.textSecondary */
    font-size: 14px;
  }

  .no-server {
    padding: 24px;
    text-align: center;
    color: var(--textSecondary); /* 替换 theme.textSecondary */
  }

  @media (max-width: 768px) {
    .users-page {
      padding: 16px;
      gap: 16px;
    }

    .page-title {
      font-size: 20px;
    }

    .page-header {
      flex-direction: column;
      align-items: stretch;
    }

    .search-form {
      max-width: none;
      order: 3;
    }

    .header-actions {
      order: 2;
      justify-content: center;
    }

    .table-container {
      margin: 0 -16px;
      border-left: none;
      border-right: none;
      border-radius: 0;
    }

    .page-footer {
      flex-direction: column-reverse;
      align-items: stretch;
    }

    .total-info {
      text-align: center;
    }

    .search-input-wrapper {
      flex-direction: column;
      gap: 12px;
    }

    .search-input {
      width: 100%;
    }
  }
`}</style>
    </div>
  );
}
