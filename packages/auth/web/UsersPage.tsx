// pages/UsersPage.tsx
import { useCallback, useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTheme } from "app/theme";
import { useAppSelector } from "app/hooks";
import { selectCurrentServer } from "setting/settingSlice";
import Button from "render/web/ui/Button";
import Pagination from "render/web/ui/Pagination";
import { useDeleteUser } from "auth/hooks/useDeleteUser";
import { useRechargeUser } from "auth/hooks/useRechargeUser";
import { Table, TableRow, TableCell } from "web/ui/Table";
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
  const [searchParams] = useSearchParams();
  const currentServer = useAppSelector(selectCurrentServer);

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

  // 获取用户列表
  const fetchUsers = useFetchUsers();
  const handleFetch = useCallback(
    async (page: number) => {
      if (!currentServer) {
        logger.debug("No server selected, skipping fetch");
        return;
      }
      logger.debug({ page }, "Fetching users");
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const data = await fetchUsers(page);
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
      handleFetch(page);
    }
  }, [currentServer, handleFetch, searchParams]);

  // 统一确认模态框状态
  const [confirmModal, setConfirmModal] = useState<{
    type?: ActionType;
    user?: User;
  }>({});
  const [confirmLoading, setConfirmLoading] = useState(false);

  // 操作成功后刷新
  const handleActionSuccess = useCallback(() => {
    handleFetch(currentPage);
  }, [currentPage, handleFetch]);

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
  const rechargeUser = useRechargeUser(() => handleFetch(currentPage));
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
      navigate(`?page=${newPage}`);
    },
    [navigate, currentPage]
  );

  // 时间格式化
  const formatTime = (time: string | null) => {
    if (!time) return "-";
    return formatDistanceToNow(new Date(time), {
      addSuffix: true,
      locale: zhCN,
    });
  };

  if (!currentServer) {
    return <div className="no-server">请先选择服务器以查看用户列表</div>;
  }

  return (
    <div className="users-page">
      <header className="page-header">
        <h1 className="page-title">用户列表</h1>
        <div className="header-actions">{/* 预留后续可能的功能按钮 */}</div>
      </header>

      {error && (
        <div className="error-container">
          <span className="error-message">{error}</span>
          <Button
            onClick={() => handleFetch(currentPage)}
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
          <div className="empty-content">暂无用户数据</div>
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

      <style href="users-page">{`
        .users-page {
          padding: 24px;
          min-height: calc(100dvh - 60px);
          display: flex;
          flex-direction: column;
          gap: 24px;

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .page-title {
          font-size: 24px;
          font-weight: 600;
          color: ${theme.text};
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .error-container {
          padding: 12px 16px;
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.error};
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .error-message {
          color: ${theme.error};
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
          background: ${theme.background};
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
          color: ${theme.textSecondary};
        }

        .empty-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          background: ${theme.backgroundSecondary};
          border-radius: 8px;
          border: 1px dashed ${theme.border};
        }

        .empty-content {
          color: ${theme.textSecondary};
          font-size: 14px;
        }

        .no-server {
          padding: 24px;
          text-align: center;
          color: ${theme.textSecondary};
        }

        @media (max-width: 768px) {
          .users-page {
            padding: 16px;
            gap: 16px;
          }

          .page-title {
            font-size: 20px;
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
        }
      `}</style>
    </div>
  );
}
