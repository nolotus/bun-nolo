// File: CreateMenuButton.jsx (Complete Code)

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "app/store";
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
import { CreateSpaceForm } from "create/space/CreateSpaceForm";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { noloAgentId } from "core/init";

// Hook to detect clicks outside a component
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

// Hook to handle page creation logic
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

const CreateMenuButton: React.FC = () => {
  const currentDialog = useAppSelector(selectCurrentDialogConfig);
  const { t } = useTranslation(["common", "space", "chat"]);

  // State for click-to-pin and hover-to-show
  const [isPinnedOpen, setPinnedOpen] = useState(false);
  const [isHovering, setHovering] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { isLoading: isCreatingDialog, createNewDialog } = useCreateDialog();
  const { isCreatingPage, createNewPage } = useCreatePage();

  const isMenuVisible = isPinnedOpen || isHovering;

  // Clear any pending hover timeout
  const clearHoverTimeout = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  // Closes the menu completely, regardless of state
  const closeMenu = useCallback(() => {
    setPinnedOpen(false);
    setHovering(false);
    clearHoverTimeout();
  }, [clearHoverTimeout]);

  useClickOutside(menuRef, closeMenu);

  // Enhanced handlers for hover interaction
  const handleMouseEnter = useCallback(() => {
    clearHoverTimeout();
    setHovering(true);
  }, [clearHoverTimeout]);

  const handleMouseLeave = useCallback(() => {
    clearHoverTimeout();
    // Add a small delay before hiding to allow smooth transition to dropdown
    hoverTimeoutRef.current = setTimeout(() => {
      setHovering(false);
    }, 100);
  }, [clearHoverTimeout]);

  // Handler for click interaction on both desktop and mobile
  const handleTogglePin = () => {
    setPinnedOpen((prev) => !prev);
    setHovering(false); // A click should always take precedence over hover
    clearHoverTimeout();
  };

  const createAndClose = (action: () => void) => () => {
    action();
    closeMenu();
  };

  const handleCreatePageAndClose = useCallback(async () => {
    await createNewPage();
    closeMenu();
  }, [createNewPage, closeMenu]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      clearHoverTimeout();
    };
  }, [clearHoverTimeout]);

  return (
    <>
      <div
        className="create-menu"
        ref={menuRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          className={`create-menu__button ${isMenuVisible ? "is-active" : ""}`}
          onClick={handleTogglePin}
          aria-label={t("common:create")}
        >
          <LuPlus
            size={16}
            className={`create-menu__icon ${isMenuVisible ? "is-rotated" : ""}`}
          />
        </button>

        {isMenuVisible && (
          <>
            <div className="create-menu__overlay" onClick={closeMenu} />
            <div className="create-menu__dropdown">
              <button
                className="create-menu__item"
                onClick={createAndClose(() => {
                  if (currentDialog?.cybots) {
                    createNewDialog({ agents: currentDialog.cybots });
                  } else {
                    createNewDialog({ agents: [noloAgentId] });
                  }
                })}
                disabled={isCreatingDialog}
              >
                {isCreatingDialog ? (
                  <div className="spinner" />
                ) : (
                  <LuMessageSquare size={16} />
                )}
                <span>{t("chat:newchat", "新建对话")}</span>
              </button>
              <button
                className="create-menu__item"
                onClick={handleCreatePageAndClose}
                disabled={isCreatingPage}
              >
                {isCreatingPage ? (
                  <div className="spinner" />
                ) : (
                  <LuFileText size={16} />
                )}
                <span>{t("page:create_new_page", "新建页面")}</span>
              </button>
              <button
                className="create-menu__item"
                onClick={createAndClose(() => setIsModalOpen(true))}
              >
                <LuFolderPlus size={16} />
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
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
        
        @keyframes slideInDesktop { 
          from { 
            opacity: 0; 
            transform: translateY(-6px) scale(0.98); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes slideInMobile { 
          from { 
            opacity: 0; 
            transform: translateY(12px) scale(0.96); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }

        .create-menu { 
          position: relative;
        }

        .create-menu__button {
          display: flex; 
          align-items: center; 
          justify-content: center;
          width: var(--space-8); 
          height: var(--space-8);
          background: transparent;
          border: none;
          border-radius: var(--space-2); 
          cursor: pointer;
          color: var(--textTertiary);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          -webkit-tap-highlight-color: transparent;
          position: relative;
          overflow: hidden;
        }

        .create-menu__button::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: var(--backgroundHover);
          opacity: 0;
          transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .create-menu__button:hover::before,
        .create-menu__button.is-active::before {
          opacity: 1;
        }

        .create-menu__button:hover,
        .create-menu__button.is-active {
          color: var(--text);
          transform: translateY(-0.5px);
        }

        .create-menu__button:active {
          transform: translateY(0) scale(0.96);
        }

        .create-menu__icon {
          position: relative;
          z-index: 1;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          stroke-width: 1.5;
        }

        .create-menu__icon.is-rotated {
          transform: rotate(45deg);
        }

        .create-menu__overlay {
          display: none;
        }

        .create-menu__dropdown {
          position: absolute;
          top: calc(100% + var(--space-1));
          right: 0; 
          min-width: 180px;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--space-3);
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.08),
            0 2px 4px -1px rgba(0, 0, 0, 0.04);
          z-index: ${zIndex.dropdown};
          padding: var(--space-1);
          animation: slideInDesktop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          backdrop-filter: blur(8px);
        }

        .create-menu__item {
          display: flex; 
          align-items: center; 
          gap: var(--space-3);
          width: 100%; 
          padding: var(--space-2) var(--space-3);
          background: transparent; 
          border: none;
          border-radius: var(--space-1); 
          cursor: pointer;
          font-size: 13px; 
          font-weight: 500;
          color: var(--text);
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          -webkit-tap-highlight-color: transparent;
          min-height: 32px;
          position: relative;
          overflow: hidden;
        }

        .create-menu__item::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: var(--backgroundHover);
          opacity: 0;
          transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .create-menu__item:hover:not(:disabled)::before {
          opacity: 1;
        }

        .create-menu__item:hover:not(:disabled) {
          transform: translateY(-0.5px);
        }

        .create-menu__item:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }

        .create-menu__item:active:not(:disabled)::before {
          background: var(--backgroundSelected);
          opacity: 1;
        }

        .create-menu__item:disabled {
          color: var(--textQuaternary); 
          cursor: not-allowed;
        }

        .create-menu__item span {
          position: relative;
          z-index: 1;
        }

        .create-menu__item svg {
          position: relative;
          z-index: 1;
          stroke-width: 1.5;
        }
        
        .spinner {
          position: relative;
          z-index: 1;
          width: 16px; 
          height: 16px;
          border: 1.5px solid var(--borderLight);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @media (max-width: 768px) {
          .create-menu__button {
            width: 40px; 
            height: 40px;
            touch-action: manipulation;
          }

          .create-menu__overlay {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.08);
            backdrop-filter: blur(4px);
            z-index: calc(${zIndex.dropdown} - 1);
          }

          .create-menu__dropdown {
            position: fixed;
            top: auto;
            bottom: var(--space-5);
            left: var(--space-4);
            right: var(--space-4);
            min-width: auto;
            max-width: 300px;
            margin: 0 auto;
            border-radius: var(--space-4);
            padding: var(--space-2);
            box-shadow: 
              0 20px 25px -5px rgba(0, 0, 0, 0.12),
              0 10px 10px -5px rgba(0, 0, 0, 0.08);
            animation: slideInMobile 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          .create-menu__item {
            padding: var(--space-3) var(--space-4);
            font-size: 14px;
            min-height: 44px;
            border-radius: var(--space-2);
          }

          .create-menu__item svg {
            width: 18px;
            height: 18px;
          }
        }
        
        @media (hover: none) and (pointer: coarse) {
          .create-menu__button:hover::before {
            opacity: 0;
          }
          
          .create-menu__button:hover {
            transform: none;
          }
          
          .create-menu__item:hover:not(:disabled)::before {
            opacity: 0;
          }
          
          .create-menu__item:hover:not(:disabled) {
            transform: none;
          }
        }
      `}</style>
    </>
  );
};

export default CreateMenuButton;
