// src/lab/date/dateRoutes.tsx
import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PaymentPromptPage from "./pages/PaymentPromptPage";
import { RequireAuthAndPayment } from "./guards/authGuard";

// 使用懒加载提升首屏性能（可选）
const MatchPage = lazy(() => import("./pages/MatchPage"));
const ChatDetail = lazy(() => import("./pages/ChatDetail"));
const MyProfile = lazy(() => import("./pages/MyProfile"));

// 懒加载 fallback loading 提示
const SuspenseFallback = () => (
  <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
);

export const dateRoutes = [
  {
    path: "/",
    element: (
      <RequireAuthAndPayment>
        <Outlet />
      </RequireAuthAndPayment>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<SuspenseFallback />}>
            <MatchPage />
          </Suspense>
        ),
      },
      {
        path: "match",
        element: (
          <Suspense fallback={<SuspenseFallback />}>
            <MatchPage />
          </Suspense>
        ),
      },
      {
        path: "chat/:partnerId",
        element: (
          <Suspense fallback={<SuspenseFallback />}>
            <ChatDetail />
          </Suspense>
        ),
      },
      {
        path: "profile",
        element: (
          <Suspense fallback={<SuspenseFallback />}>
            <MyProfile />
          </Suspense>
        ),
      },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/pay-prompt", element: <PaymentPromptPage /> },
];
