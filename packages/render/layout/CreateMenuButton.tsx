import React, { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch } from "app/store";
import { createPage } from "render/page/pageSlice";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { zIndex } from "render/styles/zIndex";

// Icons
import {
  PlusIcon,
  NoteIcon,
  ArchiveIcon,
  CommentDiscussionIcon,
} from "@primer/octicons-react";

// UI Components
import { Dialog } from "render/web/ui/Dialog";
import { Tooltip } from "render/web/ui/Tooltip";
import { CreateSpaceForm } from "create/space/CreateSpaceForm";

// --- Utility Hook: useClickOutside ---
const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

// --- Spinner Component ---
const Spinner = () => (
  <div className="spinner-small" />
  // Styles are included in the main style block below
);

// --- Custom hook for creating a new page ---
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
    } catch (error) {
      console.error("Failed to create page:", error);
      toast.error(t("createPageFailed", "创建页面失败"));
    } finally {
      setIsCreating(false);
    }
  }, [dispatch, navigate, t]);

  return { isCreatingPage: isCreating, createNewPage };
};

// --- CreateMenuButton Component ---
const CreateMenuButton = ({ currentDialogConfig }) => {
  const { t } = useTranslation(["common", "space", "chat", "page"]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { isLoading: isCreatingDialog, createNewDialog } = useCreateDialog();
  const { isCreatingPage, createNewPage } = useCreatePage();

  useClickOutside(menuRef, () => setIsMenuOpen(false));

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

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <>
      <div className="create-menu-container" ref={menuRef}>
        <Tooltip content={t("common:create")} placement="bottom">
          <button
            className="btn-action"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={t("common:create")}
          >
            <PlusIcon size={16} />
          </button>
        </Tooltip>

        {isMenuOpen && (
          <div className="create-dropdown-menu">
            <button
              className="create-menu-item"
              onClick={handleCreatePage}
              disabled={isCreatingPage}
            >
              {isCreatingPage ? <Spinner /> : <NoteIcon size={16} />}
              <span>{t("page:create_new_page", "新建页面")}</span>
            </button>
            <button className="create-menu-item" onClick={handleCreateSpace}>
              <ArchiveIcon size={16} />
              <span>{t("space:create_new_space")}</span>
            </button>
            {currentDialogConfig && (
              <button
                className="create-menu-item"
                onClick={handleCreateDialog}
                disabled={isCreatingDialog}
              >
                {isCreatingDialog ? (
                  <Spinner />
                ) : (
                  <CommentDiscussionIcon size={16} />
                )}
                <span>{t("chat:newchat")}</span>
              </button>
            )}
          </div>
        )}
      </div>

      <Dialog isOpen={isModalOpen} onClose={closeModal}>
        <CreateSpaceForm onClose={closeModal} />
      </Dialog>

      <style href="create-menu-button-styles" precedence="high">{`
        /* Spinner */
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spinner-small {
          width: 16px; height: 16px;
          border: 2px solid var(--borderLight);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Reusable Action Button Style */
        .btn-action {
          display: flex; align-items: center; justify-content: center;
          background: transparent; border: none; cursor: pointer;
          color: var(--textSecondary); width: var(--space-8); height: var(--space-8);
          border-radius: 6px; transition: all 0.15s ease; flex-shrink: 0;
        }
        .btn-action:hover {
          background: var(--backgroundHover); color: var(--text);
        }
        .btn-action:disabled { opacity: 0.5; cursor: not-allowed; }

        /* CreateMenu styles */
        .create-menu-container {
          position: relative;
        }
        .create-dropdown-menu {
          position: absolute;
          top: calc(100% + var(--space-2));
          right: 0;
          min-width: 220px;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 8px;
          box-shadow: var(--shadowHeavy);
          z-index: ${zIndex.dropdown};
          padding: var(--space-2);
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .create-menu-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) var(--space-3);
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          text-align: left;
          font-size: 14px;
          color: var(--text);
          transition: background-color 0.15s ease;
        }
        .create-menu-item:hover:not(:disabled) {
          background: var(--backgroundHover);
        }
        .create-menu-item:disabled {
          color: var(--textTertiary);
          cursor: not-allowed;
        }
        .create-menu-item > span {
          flex: 1;
        }
      `}</style>
    </>
  );
};

export default CreateMenuButton;
