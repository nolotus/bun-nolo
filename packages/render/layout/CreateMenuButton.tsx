import React, { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch } from "app/store";
import { createPage } from "render/page/pageSlice";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { zIndex } from "render/styles/zIndex";

import {
  LuPlus,
  LuFileText,
  LuFolderPlus,
  LuMessageSquare,
} from "react-icons/lu";

import { Dialog } from "render/web/ui/Dialog";
import { Tooltip } from "render/web/ui/Tooltip";
import { CreateSpaceForm } from "create/space/CreateSpaceForm";

const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
) => {
  useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler(e);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

const useCreatePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const [isCreating, setIsCreating] = useState(false);

  const createNewPage = useCallback(async () => {
    setIsCreating(true);
    try {
      const key = await dispatch(createPage()).unwrap();
      navigate(`/${key}?edit=true`);
    } catch (err) {
      console.error(err);
      toast.error(t("createPageFailed", "创建页面失败"));
    } finally {
      setIsCreating(false);
    }
  }, [dispatch, navigate, t]);

  return { isCreatingPage: isCreating, createNewPage };
};

const CreateMenuButton: React.FC<{
  currentDialogConfig?: { cybots: string[] };
}> = ({ currentDialogConfig }) => {
  const { t } = useTranslation(["common", "space", "chat"]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { isLoading: isCreatingDialog, createNewDialog } = useCreateDialog();
  const { isCreatingPage, createNewPage } = useCreatePage();

  useClickOutside(menuRef, () => setIsMenuOpen(false));

  const handleMouseEnter = () => {
    // 仅在非触控设备上启用悬停
    if (!("ontouchstart" in window)) {
      setIsMenuOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!("ontouchstart" in window)) {
      setIsMenuOpen(false);
    }
  };

  const handleCreateDialog = useCallback(() => {
    if (currentDialogConfig?.cybots) {
      createNewDialog({ agents: currentDialogConfig.cybots });
    }
    setIsMenuOpen(false);
  }, [createNewDialog, currentDialogConfig]);

  const handleCreateSpace = useCallback(() => {
    setIsModalOpen(true);
    setIsMenuOpen(false);
  }, []);

  const handleCreatePage = useCallback(async () => {
    await createNewPage();
    setIsMenuOpen(false);
  }, [createNewPage]);

  return (
    <>
      <div
        className="create-menu-container"
        ref={menuRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Tooltip content={t("common:create")} placement="bottom">
          <button
            className={`create-btn ${isMenuOpen ? "active" : ""}`}
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={t("common:create")}
          >
            <LuPlus size={16} className={isMenuOpen ? "rotated" : ""} />
          </button>
        </Tooltip>

        {isMenuOpen && (
          <>
            {/* 移动端遮罩层 */}
            <div
              className="menu-overlay"
              onClick={() => setIsMenuOpen(false)}
            />

            <div className="create-menu">
              {currentDialogConfig && (
                <button
                  className="menu-item"
                  onClick={handleCreateDialog}
                  disabled={isCreatingDialog}
                >
                  {isCreatingDialog ? (
                    <div className="spinner" />
                  ) : (
                    <LuMessageSquare size={18} />
                  )}
                  <span>{t("chat:newchat", "新建对话")}</span>
                </button>
              )}
              <button
                className="menu-item"
                onClick={handleCreatePage}
                disabled={isCreatingPage}
              >
                {isCreatingPage ? (
                  <div className="spinner" />
                ) : (
                  <LuFileText size={18} />
                )}
                <span>{t("page:create_new_page", "新建页面")}</span>
              </button>

              <button className="menu-item" onClick={handleCreateSpace}>
                <LuFolderPlus size={18} />
                <span>{t("space:create_new_space", "新建空间")}</span>
              </button>
            </div>
          </>
        )}
      </div>

      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CreateSpaceForm onClose={() => setIsModalOpen(false)} />
      </Dialog>

      <style href="create-menu-styles" precedence="high">{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideInDesktop { 
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInMobile { 
          from { opacity: 0; transform: translateY(8px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .create-menu-container { 
          position: relative;
        }

        .create-btn {
          display: flex; 
          align-items: center; 
          justify-content: center;
          width: var(--space-8); 
          height: var(--space-8);
          background: var(--backgroundSecondary);
          border: 1px solid var(--border);
          border-radius: 6px; 
          cursor: pointer;
          color: var(--textSecondary);
          transition: all 0.2s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .create-btn:hover {
          background: var(--backgroundHover);
          border-color: var(--borderHover);
          color: var(--primary);
          transform: translateY(-1px);
        }

        .create-btn:active {
          transform: scale(0.95);
        }

        .create-btn.active {
          background: var(--primaryBg);
          border-color: var(--primary);
          color: var(--primary);
        }

        .create-btn svg {
          transition: transform 0.2s ease;
        }

        .create-btn svg.rotated {
          transform: rotate(45deg);
        }

        .menu-overlay {
          display: none;
        }

        .create-menu {
          position: absolute;
          top: calc(100% + var(--space-2));
          right: 0; 
          min-width: 200px;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 8px;
          box-shadow: 0 4px 20px var(--shadowMedium);
          z-index: ${zIndex.dropdown};
          padding: var(--space-2);
          animation: slideInDesktop 0.2s ease;
        }

        .menu-item {
          display: flex; 
          align-items: center; 
          gap: var(--space-3);
          width: 100%; 
          padding: var(--space-2) var(--space-3);
          background: transparent; 
          border: none;
          border-radius: 4px; 
          cursor: pointer;
          font-size: 14px; 
          color: var(--text);
          transition: all 0.15s ease;
          -webkit-tap-highlight-color: transparent;
          min-height: 36px;
        }

        .menu-item:hover:not(:disabled) {
          background: var(--backgroundHover);
        }

        .menu-item:active:not(:disabled) {
          background: var(--backgroundSelected);
          transform: scale(0.98);
        }

        .menu-item:disabled {
          color: var(--textTertiary); 
          cursor: not-allowed;
        }

        .menu-item + .menu-item {
          margin-top: var(--space-1);
        }

        .spinner {
          width: 16px; 
          height: 16px;
          border: 2px solid var(--borderLight);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* 移动端优化 */
        @media (max-width: 768px) {
          .create-btn {
            width: 40px; 
            height: 40px;
            touch-action: manipulation;
          }

          .menu-overlay {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(2px);
            z-index: calc(${zIndex.dropdown} - 1);
          }

          .create-menu {
            position: fixed;
            top: auto;
            bottom: var(--space-4);
            left: var(--space-4);
            right: var(--space-4);
            min-width: auto;
            max-width: 320px;
            margin: 0 auto;
            border-radius: 12px;
            padding: var(--space-3);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
            animation: slideInMobile 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          .menu-item {
            padding: var(--space-4) var(--space-4);
            font-size: 15px;
            min-height: 48px;
            border-radius: 8px;
          }

          .menu-item svg {
            width: 20px;
            height: 20px;
          }

          .menu-item + .menu-item {
            margin-top: var(--space-2);
          }

          .spinner {
            width: 18px;
            height: 18px;
          }
        }

        /* 小屏移动设备 */
        @media (max-width: 480px) {
          .create-menu {
            bottom: var(--space-3);
            left: var(--space-3);
            right: var(--space-3);
          }
        }

        /* 触控设备优化 */
        @media (hover: none) and (pointer: coarse) {
          .create-btn:hover {
            transform: none;
          }
          
          .menu-item:hover:not(:disabled) {
            background: transparent;
          }
        }
      `}</style>
    </>
  );
};

export default CreateMenuButton;
