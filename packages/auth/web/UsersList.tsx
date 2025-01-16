// pages/UsersPage.tsx
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useTheme } from "app/theme";
import { API_ENDPOINTS } from "database/config";
import { useAppSelector } from "app/hooks";
import { selectCurrentServer } from "setting/settingSlice";
import Button from "web/ui/Button";
import Pagination from "web/ui/Pagination";
import { useDeleteUser } from "auth/hooks/useDeleteUser";
import { useRechargeUser } from "auth/hooks/useRechargeUser";
import { Table, TableRow, TableCell } from "web/ui/Table";
import pino from "pino";

const logger = pino({ name: "UsersPage" });
const PAGE_SIZE = 10;

interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
}

interface PaginationState {
  currentPage: number;
  total: number;
  totalPages: number;
}

export default function UsersPage() {
  const theme = useTheme();
  const currentServer = useAppSelector(selectCurrentServer);
  const [state, setState] = useState({
    users: [] as User[],
    loading: true,
    error: null as string | null,
    pagination: {
      currentPage: 1,
      total: 0,
      totalPages: 0,
    } as PaginationState,
  });

  const { users, loading, error, pagination } = state;

  const fetchUsers = useCallback(
    async (page: number) => {
      if (!currentServer) return;

      logger.info({ page, pageSize: PAGE_SIZE }, "Fetching users");
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(
          `${currentServer}${API_ENDPOINTS.USERS}/users?page=${page}&pageSize=${PAGE_SIZE}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        logger.info(
          {
            recordsReceived: data.list.length,
            total: data.total,
            page: data.currentPage,
          },
          "Users fetched successfully"
        );

        setState((prev) => ({
          ...prev,
          users: data.list,
          pagination: {
            currentPage: page,
            total: data.total,
            totalPages: Math.ceil(data.total / PAGE_SIZE),
          },
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
    [currentServer]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const deleteUser = useDeleteUser(currentServer, () =>
    fetchUsers(pagination.currentPage)
  );
  const rechargeUser = useRechargeUser(currentServer, () =>
    fetchUsers(pagination.currentPage)
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      logger.debug(
        { from: pagination.currentPage, to: newPage },
        "Page change requested"
      );
      fetchUsers(newPage);
    },
    [fetchUsers, pagination.currentPage]
  );

  if (!currentServer) {
    return <div className="no-server">请先选择服务器以查看用户列表</div>;
  }

  const renderTable = () => (
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
                    onClick={() => deleteUser(user.id)}
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
  );

  return (
    <div className="users-page">
      <h1 className="page-title">用户列表</h1>

      {error && (
        <div className="error-container">
          <span className="error-message">{error}</span>
          <Button
            onClick={() => fetchUsers(pagination.currentPage)}
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
          {renderTable()}
          <Pagination
            className="pagination-container"
            currentPage={pagination.currentPage}
            totalItems={pagination.total}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <div className="empty-container">暂无用户数据</div>
      )}

      <style jsx>{`
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
          text-align: center;
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
