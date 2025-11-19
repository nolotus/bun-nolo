import React, { Suspense, lazy, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { zIndex } from "render/styles/zIndex";
import { useSendPermission } from "../hooks/useSendPermission";
import { useAppSelector, useAppDispatch } from "app/store";
import {
  selectCurrentUserBalance,
  fetchUserProfile,
  selectUserId,
} from "auth/authSlice";

const MessageInput = lazy(() => import("./MessageInput"));

// --- 样式常量 ---
// 核心修改：完全复刻 MessageInput 的布局逻辑 (padding/max-width)
const STYLES = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%, 100% { opacity: 0.4; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.1); } }
  
  /* 1. 外层容器：对应 .message-input */
  .skel-container, .err-container {
    width: 100%;
    padding: var(--space-4);
    padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom, 0px));
    display: flex; justify-content: center; /* 居中 wrapper */
    animation: fadeIn 0.3s ease-out;
  }

  /* 2. 布局包装器：对应 .message-input__wrapper */
  .skel-wrapper {
    width: 100%;
    /* padding 逻辑将在下方 media query 中精确匹配 */
  }

  /* 3. 骨架条/错误框：对应 .message-input__textarea */
  .skel-bar, .err-box {
    width: 100%;
    height: 72px; /* Desktop height */
    border-radius: var(--space-3);
    background: var(--backgroundSecondary);
    display: flex; align-items: center; justify-content: center;
  }
  
  .skel-bar { border: 1px solid var(--border); }
  
  .err-box {
    border: 1px solid var(--error);
    color: var(--error);
    font-size: 0.875rem;
    gap: var(--space-2);
    z-index: ${zIndex.messageInputContainerZIndex};
    box-shadow: 0 2px 4px var(--shadowLight);
  }

  /* 动画圆点 */
  .loading-dots { display: flex; gap: 6px; }
  .dot {
    width: 5px; height: 5px; border-radius: 50%; background-color: var(--textTertiary);
    animation: pulse 1.4s infinite ease-in-out both;
  }
  .dot:nth-child(1) { animation-delay: -0.32s; }
  .dot:nth-child(2) { animation-delay: -0.16s; }
  
  .recharge-link { color: var(--primary); cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }
  .recharge-link:hover { color: var(--hover); }

  /* --- 响应式完全对齐 MessageInput --- */
  @media (max-width: 768px) {
    .skel-container, .err-container { padding: var(--space-3); } /* Container padding */
    .skel-wrapper { padding-left: 0; padding-right: 0; } /* Wrapper padding */
    .skel-bar, .err-box { height: 66px; } /* Input height */
  }
  @media (min-width: 768px) { .skel-wrapper { padding-left: var(--space-8); padding-right: var(--space-8); } }
  @media (min-width: 1024px) { .skel-wrapper { padding-left: var(--space-12); padding-right: var(--space-12); } }
  
  @media (min-width: 1280px) { .skel-wrapper { max-width: 940px; } }
  @media (min-width: 1440px) { .skel-wrapper { max-width: 980px; } }
  @media (min-width: 1600px) { .skel-wrapper { max-width: 1080px; } }
`;

const LoadingPlaceholder = () => (
  <div className="skel-container">
    <style href="msg-input-styles" precedence="component">
      {STYLES}
    </style>
    <div className="skel-wrapper">
      <div className="skel-bar">
        <div className="loading-dots">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </div>
      </div>
    </div>
  </div>
);

const ErrorMessage = ({
  message,
  showRecharge,
  onRecharge,
}: {
  message: string;
  showRecharge?: boolean;
  onRecharge: () => void;
}) => {
  const { t } = useTranslation("chat");
  return (
    <div className="err-container">
      <style href="msg-input-styles" precedence="component">
        {STYLES}
      </style>
      <div className="skel-wrapper">
        <div className="err-box">
          <span>{message}</span>
          {showRecharge && (
            <span className="recharge-link" onClick={onRecharge}>
              {t("recharge", "充值")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const MessageInputContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const balance = useAppSelector(selectCurrentUserBalance);
  const userId = useAppSelector(selectUserId);
  const { sendPermission, getErrorMessage } = useSendPermission(balance ?? 0);

  const isLoading = typeof balance !== "number";

  useEffect(() => {
    import("./MessageInput");
    if (userId) dispatch(fetchUserProfile());
  }, [userId, dispatch]);

  if (isLoading) return <LoadingPlaceholder />;

  if (!sendPermission.allowed) {
    return (
      <ErrorMessage
        message={getErrorMessage(sendPermission.reason, sendPermission.pricing)}
        showRecharge={sendPermission.reason === "INSUFFICIENT_BALANCE"}
        onRecharge={() => navigate("/recharge")}
      />
    );
  }

  return (
    <Suspense fallback={<LoadingPlaceholder />}>
      <MessageInput />
    </Suspense>
  );
};

export default MessageInputContainer;
