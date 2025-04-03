// web/ui/Pagination.tsx
import React from "react";
import { useTheme } from "app/theme";
import Button from "render/web/ui/Button";
import pino from "pino";

const logger = pino({ name: "Pagination" });

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  className = "",
}: PaginationProps) {
  const theme = useTheme();
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisiblePages) {
      // 显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 智能显示页码
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);

      // 调整start以确保显示足够的页码
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      // 添加首页
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }

      // 添加中间页码
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // 添加末页
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page === currentPage) return;

    logger.debug({ from: currentPage, to: page }, "Page change requested");
    onPageChange(page);
  };

  if (totalItems === 0) return null;

  return (
    <>
      <div className={`pagination ${className}`}>
        <div className="pagination-info">
          显示 {startItem}-{endItem} 条，共 {totalItems} 条
        </div>

        <div className="pagination-buttons">
          <Button
            variant="secondary"
            size="small"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(1)}
            className="page-button"
          >
            首页
          </Button>

          <Button
            variant="secondary"
            size="small"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="page-button"
          >
            上一页
          </Button>

          {getPageNumbers().map((pageNum, index) =>
            pageNum === "..." ? (
              <span key={`ellipsis-${index}`} className="ellipsis">
                ...
              </span>
            ) : (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? "primary" : "secondary"}
                size="small"
                className="page-button"
                onClick={() => handlePageChange(pageNum as number)}
                disabled={pageNum === currentPage}
              >
                {pageNum}
              </Button>
            )
          )}

          <Button
            variant="secondary"
            size="small"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="page-button"
          >
            下一页
          </Button>

          <Button
            variant="secondary"
            size="small"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
            className="page-button"
          >
            末页
          </Button>
        </div>
      </div>

      <style jsx>{`
        .pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          gap: 16px;
          flex-wrap: wrap;
        }

        .pagination-info {
          font-size: 14px;
          color: ${theme.textSecondary};
          white-space: nowrap;
        }

        .pagination-buttons {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        .ellipsis {
          color: ${theme.textSecondary};
          padding: 0 4px;
          user-select: none;
        }

        :global(.page-button) {
          min-width: 32px;
          height: 32px;
          padding: 0 8px;
        }

        @media (max-width: 640px) {
          .pagination {
            justify-content: center;
          }

          .pagination-info {
            width: 100%;
            text-align: center;
            order: 2;
          }

          .pagination-buttons {
            width: 100%;
            justify-content: center;
            order: 1;
          }
        }
      `}</style>
    </>
  );
}
