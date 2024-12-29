import React from "react";
import { useTheme } from "app/theme";

export const Select = (props) => {
  const theme = useTheme();

  const selectStyles = {
    width: "100%",
    height: "36px", // 固定高度让外观更统一
    padding: "0 12px",
    border: `1px solid ${theme.border}`,
    borderRadius: "8px",
    backgroundColor: theme.background,
    color: theme.text,
    fontSize: "14px",
    lineHeight: "36px",
    transition: "all 0.15s ease-in-out",
    cursor: "pointer",
    outline: "none",
    appearance: "none", // 移除默认的下拉箭头样式
  };

  return (
    <>
      <style>
        {`
          select {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4 6L8 10L12 6' stroke='${theme.textSecondary.replace('#', '%23')}' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 12px center;
          }
          
          select:hover {
            border-color: ${theme.borderHover};
          }

          select:focus {
            border-color: ${theme.primary};
            box-shadow: 0 0 0 2px ${theme.primaryGhost};
          }

          select:disabled {
            background-color: ${theme.backgroundSecondary};
            color: ${theme.textLight};
            cursor: not-allowed;
          }
          
          /* 适配暗色模式 */
          @media (prefers-color-scheme: dark) {
            select {
              background-color: ${theme.background};
              color: ${theme.text};
            }
          }
        `}
      </style>
      <select {...props} style={selectStyles} />
    </>
  );
};
