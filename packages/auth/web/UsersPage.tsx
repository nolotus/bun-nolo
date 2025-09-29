// pages/UsersPage.tsx
import { useCallback, useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useTheme } from "app/theme";
import { useAppSelector } from "app/store";
import { selectCurrentServer } from "app/settings/settingSlice";
import { useFetchUsers } from "auth/hooks/useFetchUsers";
import { useDeleteUser } from "auth/hooks/useDeleteUser";
import { useRechargeUser } from "auth/hooks/useRechargeUser";
import { useDisableUser } from "auth/hooks/useDisableUser";
import { useEnableUser } from "auth/hooks/useEnableUser";
import Button from "render/web/ui/Button";
import Pagination from "render/web/ui/Pagination";
import { Table, TableRow, TableCell } from "render/web/ui/Table";
import { ConfirmModal } from "render/web/ui/ConfirmModal";
import { RechargeModal } from "life/web/RechargeModal";
import SearchInput from "render/web/ui/SearchInput";

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
  const [searchParams, setSearchParams] = useSearchParams();
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

  // 获取用户列表
  const fetchUsers = useFetchUsers();
  const handleFetch = useCallback(
    async (page: number, search?: string) => {
      if (!currentServer) {
        return;
      }
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const data = await fetchUsers(page, search);
        if (!data?.list) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "无法获取数据",
            users: [],
          }));
          return;
        }
        setState((prev) => ({
          ...prev,
          users: data.list,
          currentPage: page,
          total: data.total,
          totalPages: data.totalPages,
          loading: false,
        }));
      } catch (err) {
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
      handleFetch(page, search);
    }
  }, [currentServer, handleFetch, searchParams]);

  // 搜索处理
  const handleSearch = useCallback(() => {
    const trimmedSearch = searchInput.trim();
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        if (trimmedSearch) {
          newParams.set("search", trimmedSearch);
        } else {
          newParams.delete("search");
        }
        newParams.set("page", "1");
        return newParams;
      },
      { replace: true }
    );
    setSearchInput(trimmedSearch);
  }, [searchInput, setSearchParams]);

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
    handleFetch(currentPage, search);
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
    const search = searchParams.get("search") || undefined;
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
      } catch (err) {
        throw err;
      }
    },
    [rechargeModal.userId, rechargeUser]
  );

  // 分页
  const handlePageChange = useCallback(
    (newPage: number) => {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set("page", newPage.toString());
          return newParams;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // 时间格式化
  const formatTime = (time: string | null) => {
    if (!time) return "-";
    return formatDistanceToNow(new Date(time), {
      addSuffix: true,
      locale: zhCN,
    });
  };

  // 发送邮件
  const handleSendEmail = useCallback((email: string) => {
    if (!email) {
      alert("邮箱地址不存在");
      return;
    }
    window.location.href = `mailto:${email}`;
  }, []);

  if (!currentServer) {
    return (
      <div className="no-server-container">
        <div className="no-server-content">
          <h2>未选择服务器</h2>
          <p>请先选择服务器以查看用户列表</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <header className="page-header">
        <div className="header-left">
          <h1 className="page-title">用户列表</h1>
          <div className="title-decoration"></div>
        </div>

        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          onSearch={handleSearch}
          onClear={handleClearSearch}
          placeholder="搜索用户名、ID 或邮箱..."
        />

        <div className="header-actions">{/* 预留未来功能按钮 */}</div>
      </header>

      {error && (
        <div className="error-container">
          <div className="error-content">
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
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-content">
            <Button loading variant="primary">
              加载中...
            </Button>
          </div>
        </div>
      ) : users.length > 0 ? (
        <>
          <div className="table-section">
            <div className="table-wrapper">
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
                        <div className="user-name-cell">
                          <span className="username">{user.username}</span>
                          {user.isDisabled && (
                            <span className="disabled-badge">已停用</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell element={{}}>
                        <span className="email-text">{user.email || "-"}</span>
                      </TableCell>
                      <TableCell element={{}}>
                        <span className="balance-amount">
                          ¥ {user.balance.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell element={{}}>
                        <span className="time-text">
                          {formatTime(user.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell element={{}}>
                        <span className="time-text">
                          {formatTime(user.lastLoginAt)}
                        </span>
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
                                发邮件
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
          </div>

          <footer className="page-footer">
            <div className="pagination-wrapper">
              <Pagination
                currentPage={currentPage}
                totalItems={total}
                pageSize={PAGE_SIZE}
                onPageChange={handlePageChange}
              />
            </div>
            <div className="total-info">
              共 <span className="total-count">{total}</span> 个用户
            </div>
          </footer>
        </>
      ) : (
        <div className="empty-container">
          <div className="empty-content">
            <div className="empty-icon">📋</div>
            <div className="empty-title">
              {searchInput ? "未找到匹配用户" : "暂无用户数据"}
            </div>
            <div className="empty-description">
              {searchInput
                ? `没有找到与「${searchInput}」匹配的用户`
                : "当前服务器还没有用户注册"}
            </div>
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
          padding: var(--space-6);
          min-height: calc(100dvh - 60px);
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
          background: var(--backgroundSecondary);
        }

        /* 页头优化 */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--space-4);
          padding: var(--space-4) var(--space-6);
          background: var(--background);
          border-radius: 12px;
          border: 1px solid var(--borderLight);
          box-shadow: var(--shadowLight);
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .page-title {
          font-size: 24px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
          line-height: 1.2;
        }

        .title-decoration {
          width: 32px;
          height: 3px;
          background: linear-gradient(90deg, var(--primary), var(--primaryLight));
          border-radius: 2px;
        }

        .header-actions {
          display: flex;
          gap: var(--space-3);
          min-width: 100px;
        }

        /* 无服务器状态优化 */
        .no-server-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .no-server-content {
          text-align: center;
          padding: var(--space-8);
          background: var(--background);
          border-radius: 12px;
          border: 1px solid var(--borderLight);
          box-shadow: var(--shadowLight);
        }

        .no-server-content h2 {
          color: var(--text);
          margin: 0 0 var(--space-2);
          font-size: 20px;
          font-weight: 600;
        }

        .no-server-content p {
          color: var(--textSecondary);
          margin: 0;
          font-size: 14px;
        }

        /* 错误容器优化 */
        .error-container {
          background: var(--background);
          border: 1px solid var(--error);
          border-radius: 8px;
          overflow: hidden;
        }

        .error-content {
          padding: var(--space-4);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
          background: linear-gradient(90deg, 
            rgba(239, 68, 68, 0.02), 
            rgba(239, 68, 68, 0.01)
          );
        }

        .error-message {
          color: var(--error);
          font-weight: 500;
        }

        /* 加载状态优化 */
        .loading-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
        }

        .loading-content {
          text-align: center;
        }

        /* 表格区域优化 */
        .table-section {
          background: var(--background);
          border-radius: 12px;
          border: 1px solid var(--borderLight);
          box-shadow: var(--shadowLight);
          overflow: hidden;
          flex: 1;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .table-wrapper table {
          table-layout: fixed;
          width: 100%;
          min-width: 800px;
          border-collapse: separate;
          border-spacing: 0;
        }

        .table-wrapper th,
        .table-wrapper td {
          padding: var(--space-4);
          border-bottom: 1px solid var(--borderLight);
          border-right: 1px solid var(--borderLight);
          vertical-align: middle;
        }

        .table-wrapper th:last-child,
        .table-wrapper td:last-child {
          border-right: none;
        }

        .table-wrapper tbody tr:last-child td {
          border-bottom: none;
        }

        /* 表头样式 */
        .table-wrapper thead th {
          background: var(--backgroundTertiary);
          font-weight: 600;
          color: var(--textSecondary);
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        /* 表格行悬停效果 */
        .table-wrapper tbody tr {
          transition: background-color 0.15s ease;
        }

        .table-wrapper tbody tr:hover {
          background: var(--backgroundHover);
        }

        /* 精确控制每列宽度 */
        .table-wrapper th:nth-child(1),
        .table-wrapper td:nth-child(1) {
          width: 15%;
          min-width: 120px;
        }

        .table-wrapper th:nth-child(2),
        .table-wrapper td:nth-child(2) {
          width: 20%;
          min-width: 150px;
        }

        .table-wrapper th:nth-child(3),
        .table-wrapper td:nth-child(3) {
          width: 12%;
          min-width: 90px;
        }

        .table-wrapper th:nth-child(4),
        .table-wrapper td:nth-child(4) {
          width: 13%;
          min-width: 100px;
        }

        .table-wrapper th:nth-child(5),
        .table-wrapper td:nth-child(5) {
          width: 13%;
          min-width: 100px;
        }

        .table-wrapper th:nth-child(6),
        .table-wrapper td:nth-child(6) {
          width: 27%;
          min-width: 240px;
        }

        /* 用户名列样式优化 */
        .user-name-cell {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          overflow: hidden;
        }

        .username {
          font-weight: 500;
          color: var(--text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .disabled-badge {
          background: var(--error);
          color: white;
          font-size: 10px;
          font-weight: 600;
          padding: 2px var(--space-1);
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* 邮箱列样式 */
        .email-text {
          color: var(--textSecondary);
          font-size: 13px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: block;
        }

        /* 余额列样式优化 */
        .balance-amount {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Consolas', monospace;
          font-variant-numeric: tabular-nums;
          font-weight: 600;
          color: var(--primary);
          display: block;
          text-align: right;
          font-size: 14px;
        }

        /* 时间列样式优化 */
        .time-text {
          font-size: 12px;
          color: var(--textTertiary);
          display: block;
          font-weight: 400;
        }

        /* 操作按钮组优化 */
        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-1);
          justify-content: flex-end;
          align-items: center;
          min-height: 32px;
        }

        .action-buttons > * {
          flex-shrink: 0;
          min-width: 48px;
          font-size: 11px;
          padding: var(--space-1) var(--space-2);
          height: 28px;
          line-height: 1;
          font-weight: 500;
        }

        /* 页脚优化 */
        .page-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
          padding: var(--space-4) var(--space-6);
          background: var(--background);
          border-radius: 12px;
          border: 1px solid var(--borderLight);
          box-shadow: var(--shadowLight);
        }

        .pagination-wrapper {
          flex: 1;
        }

        .total-info {
          font-size: 14px;
          color: var(--textSecondary);
          font-weight: 500;
        }

        .total-count {
          color: var(--primary);
          font-weight: 600;
        }

        /* 空状态优化 */
        .empty-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .empty-content {
          text-align: center;
          padding: var(--space-8);
          background: var(--background);
          border-radius: 12px;
          border: 1px dashed var(--border);
          max-width: 400px;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: var(--space-4);
          opacity: 0.3;
        }

        .empty-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: var(--space-2);
        }

        .empty-description {
          font-size: 14px;
          color: var(--textSecondary);
          line-height: 1.5;
        }

        @media (max-width: 1200px) {
          .table-wrapper th:nth-child(6),
          .table-wrapper td:nth-child(6) {
            min-width: 200px;
          }
          
          .action-buttons > * {
            min-width: 40px;
            font-size: 10px;
            padding: var(--space-1);
          }
        }

        @media (max-width: 768px) {
          .users-page {
            padding: var(--space-4);
            gap: var(--space-4);
          }

          .page-header {
            flex-direction: column;
            align-items: stretch;
            padding: var(--space-4);
          }

          .header-left {
            order: 1;
          }

          .header-actions {
            order: 2;
            justify-content: center;
          }

          .page-title {
            font-size: 20px;
          }

          .table-section {
            margin: 0 calc(-1 * var(--space-4));
            border-radius: 0;
            border-left: none;
            border-right: none;
          }

          .table-wrapper table {
            min-width: 600px;
          }

          .action-buttons {
            flex-direction: column;
            gap: 2px;
            align-items: stretch;
          }

          .action-buttons > * {
            min-width: unset;
            width: 100%;
            font-size: 11px;
            height: 24px;
          }

          .page-footer {
            flex-direction: column-reverse;
            align-items: stretch;
            gap: var(--space-3);
            padding: var(--space-4);
          }

          .total-info {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
