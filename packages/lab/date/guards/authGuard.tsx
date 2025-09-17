// src/lab/date/guards/authGuard.tsx
import { useEffect } from "react";
import { useNavigate, Navigate, Outlet } from "react-router-dom";

interface RequireAuthAndPaymentProps {
  children?: React.ReactNode;
}

export const RequireAuthAndPayment = ({
  children,
}: RequireAuthAndPaymentProps) => {
  const navigate = useNavigate();

  // 客户端才执行的守卫检查
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const isPaid = localStorage.getItem("isPaid") === "true";

    if (!isLoggedIn) {
      navigate("/login");
    } else if (!isPaid) {
      navigate("/pay-prompt");
    }
  }, [navigate]);

  // SSR 环境返回 null 或空内容，避免报错
  if (typeof window === "undefined") {
    return null;
  }

  // 客户端再判断真实状态（不在 useEffect 中判断是为了更快响应 UI）
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const isPaid = localStorage.getItem("isPaid") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!isPaid) {
    return <Navigate to="/pay-prompt" replace />;
  }

  return <>{children || <Outlet />}</>;
};
