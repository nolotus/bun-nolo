// pages/UsersPage.tsx
import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTheme } from "app/theme";
import { useAppSelector } from "app/hooks";
import { selectCurrentServer } from "setting/settingSlice";
import Button from "web/ui/Button";
import Pagination from "web/ui/Pagination";
import { useDeleteUser } from "auth/hooks/useDeleteUser";
import { useRechargeUser } from "auth/hooks/useRechargeUser";
import { Table, TableRow, TableCell } from "web/ui/Table";
import { ConfirmModal } from "web/ui/ConfirmModal";
import pino from "pino";
import { useFetchUsers } from "../hooks/useFetchUsers";

const logger = pino({ name: "UsersPage" });
const PAGE_SIZE = 10;

interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
}

export default function UsersPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [searchParams] = useSearchParams();
  const currentServer = useAppSelector(selectCurrentServer);

  const [state, setState] = useState({
    users: [] as User[],
    loading: false,
    error: null as string | null,
    currentPage: parseInt(searchParams.get("page") || "1"),
    total: 0,
    totalPages: 0,
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: "",
  });

  const { users, loading, error, currentPage, total } = state;

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
      const page = parseInt(searchParams.get("page") || "1");
      handleFetch(page);
    }
  }, [handleFetch, searchParams, currentServer]);

  const handleDeleteSuccess = useCallback(() => {
    logger.debug({ page: currentPage }, "Delete success, refreshing");
    handleFetch(currentPage);
  }, [currentPage, handleFetch]);

  const deleteUser = useDeleteUser(handleDeleteSuccess);

  const handleDeleteClick = useCallback((userId: string) => {
    logger.debug({ userId }, "Delete button clicked");
    setDeleteModal({ isOpen: true, userId });
  }, []);

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(deleteModal.userId);
      setDeleteModal({ isOpen: false, userId: "" });
    } catch (err) {
      logger.error({ err }, "Delete failed");
      alert("删除失败，请重试");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, userId: "" });
  };

  const rechargeUser = useRechargeUser(() => handleFetch(currentPage));

  const handlePageChange = useCallback(
    (newPage: number) => {
      logger.debug({ from: currentPage, to: newPage }, "Page change requested");
      navigate(`?page=${newPage}`);
    },
    [navigate, currentPage]
  );

  if (!currentServer) {
    return <div className="no-server">请先选择服务器以查看用户列表</div>;
  }

  return (
    <div className="users-page">
      <h1 className="page-title">用户列表</h1>

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
                  <TableCell element={{ header: true }}>操作</TableCell>
                </TableRow>
              </thead>
              <tbody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell element={{}}>{user.username}</TableCell>
                    <TableCell element={{}}>{user.email || "-"}</TableCell>
                    <TableCell element={{}}>
                      {user.balance?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell element={{}}>
                      <div className="action-buttons">
                        <Button
                          onClick={() => rechargeUser(user.id)}
                          variant="primary"
                          size="small"
                        >
                          充值
                        </Button>
                        <Button
                          onClick={() => handleDeleteClick(user.id)}
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
          <Pagination
            className="pagination-container"
            currentPage={currentPage}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <div className="empty-container">暂无用户数据</div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="删除用户"
        message="确定要删除此用户吗？此操作无法撤销。"
        status="error"
      />

      <style>{`
        .users-page {
          padding: 24px;
          min-height: calc(100vh - 48px);
          display: flex;
          flex-direction: column;
        }
        .page-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 24px;
          color: ${theme.text};
        }
        .table-container {
          flex: 1;
          overflow: auto;
          margin-bottom: 24px;
        }
        .action-buttons {
          display: flex;
          gap: 8px;
          white-space: nowrap;
        }
        .error-container {
          margin-bottom: 24px;
          padding: 16px;
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
          display: flex;
          justify-content: center;
          align-items: center;
          flex: 1;
          min-height: 200px;
        }
        .pagination-container {
          margin-top: auto;
          padding-top: 24px;
        }
        .empty-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${theme.textSecondary};
          padding: 48px;
          background: ${theme.backgroundSecondary};
          border-radius: 8px;
        }
        .no-server {
          padding: 16px;
          text-align: center;
          color: ${theme.textSecondary};
        }
        @media (max-width: 640px) {
          .users-page {
            padding: 16px;
          }
          .table-container {
            margin: -16px;
          }
        }
      `}</style>
    </div>
  );
}
