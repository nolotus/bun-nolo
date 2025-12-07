// chat/dialog/DialogPage.tsx
import React, { useEffect, Suspense } from "react";
import { useAppDispatch, useAppSelector } from "app/store";
import { useAuth } from "auth/hooks/useAuth";
import { useTranslation } from "react-i18next";

import {
  clearDialogState,
  initDialog,
  selectCurrentDialogConfig,
} from "chat/dialog/dialogSlice";
import MessageInputContainer from "chat/web/MessageInputContainer";
import MessagesList from "chat/messages/web/MessageList";
import {
  initMsgs,
  resetMsgs,
  selectIsLoadingInitial,
  selectMessageError,
} from "chat/messages/messageSlice";
import { extractCustomId } from "core/prefix";
import PageLoading from "render/web/ui/PageLoading";

// 懒加载组件
const GuestGuide = React.lazy(() => import("render/web/ui/GuestGuide"));
const ErrorView = React.lazy(() => import("render/web/ui/ErrorView"));

const DialogPage = ({ pageKey }: { pageKey: string }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("chat");
  const { user, isLoggedIn } = useAuth();
  const dialogId = pageKey ? extractCustomId(pageKey) : null;

  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const isLoadingInitial = useAppSelector(selectIsLoadingInitial);
  const error = useAppSelector(selectMessageError);

  // 初始化对话 & 消息
  useEffect(() => {
    if (pageKey && user && dialogId) {
      dispatch(initDialog(pageKey));
      dispatch(initMsgs({ dialogId, limit: 20 }));
    }
  }, [pageKey, user?.userId, dispatch, dialogId]);

  // 卸载时清理
  useEffect(() => {
    return () => {
      dispatch(clearDialogState());
      dispatch(resetMsgs());
    };
  }, [dispatch]);

  const renderContent = () => {
    // 未登录：访客引导
    if (!isLoggedIn) {
      return (
        <Suspense fallback={<PageLoading message="检查权限" />}>
          <div style={{ flex: 1 }}>
            <GuestGuide />
          </div>
        </Suspense>
      );
    }

    // 初次加载
    if (isLoadingInitial) {
      return <PageLoading message="加载对话数据" />;
    }

    // 错误态
    if (error) {
      return (
        <Suspense fallback={<PageLoading />}>
          <div style={{ flex: 1 }}>
            <ErrorView error={error} />
          </div>
        </Suspense>
      );
    }

    // 正常对话
    if (currentDialogConfig && dialogId) {
      return (
        <>
          {/* 消息区域，占据剩余空间（滚动逻辑在 MessagesList 内部） */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <MessagesList dialogId={dialogId} />
          </div>

          {/* 底部输入框（内部 position: sticky; bottom: 0） */}
          <MessageInputContainer />
        </>
      );
    }

    // 未选择对话
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-5)",
          color: "var(--textSecondary)",
        }}
      >
        {t("selectADialog")}
      </div>
    );
  };

  return (
    <>
      {currentDialogConfig?.title && <title>{currentDialogConfig.title}</title>}

      {/* 聊天页根容器：负责整页宽度 / 左右安全区 / 垂直布局 */}
      <div className="DialogPage-root">
        {renderContent()}

        <style href="DialogPage-styles" precedence="default">{`
          .DialogPage-root {
            /* 在 MainLayout__main（滚动容器）内部居中 */
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            min-height: 100%;
            /* 默认：适配 13~15 寸笔记本 */
            max-width: 960px;
            padding-inline: 16px;
            padding-block: var(--space-4);
            /* 不设置 background，直接继承 MainLayout__main 的背景色，
               保证顶部、侧边栏、输入框和内容区颜色一致 */
          }

          /* 小屏手机（<= 480px）：几乎铺满，减少左右留白 */
          @media (max-width: 480px) {
            .DialogPage-root {
              max-width: 100%;
              padding-inline: 10px;
              padding-block: var(--space-3);
            }
          }

          /* 一般手机 / 小平板（481~768px） */
          @media (min-width: 481px) and (max-width: 768px) {
            .DialogPage-root {
              max-width: 100%;
              padding-inline: 12px;
              padding-block: var(--space-3);
            }
          }

          /* 笔记本 / 小桌面（769~1199px） */
          @media (min-width: 769px) and (max-width: 1199px) {
            .DialogPage-root {
              max-width: 960px;
              padding-inline: 20px;
            }
          }

          /* 大屏桌面（1200~1599px，例如 24 寸） */
          @media (min-width: 1200px) and (max-width: 1599px) {
            .DialogPage-root {
              max-width: 1040px;
              padding-inline: 24px;
            }
          }

          /* 超大屏（>= 1600px，例如 27 寸） */
          @media (min-width: 1600px) {
            .DialogPage-root {
              max-width: 1180px;
              padding-inline: 32px;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default DialogPage;
