import React, { useState, useRef, useEffect } from "react";
import { FileAddedIcon, PlusIcon } from "@primer/octicons-react";
import { MdCategory } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useTheme } from "app/theme";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { createPage } from "render/page/pageSlice";
import { addCategory, selectCurrentSpaceId } from "create/space/spaceSlice";
import { AddCategoryModal } from "create/space/category/AddCategoryModal";
import { Dialog } from "render/web/ui/Dialog";
import { CreateSpaceForm } from "create/space/CreateSpaceForm";

export const CreateMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  const spaceId = useAppSelector(selectCurrentSpaceId);

  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [spaceOpen, setSpaceOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 点击外部或按 ESC 关闭下拉菜单
  useEffect(() => {
    const handler = (e: MouseEvent | KeyboardEvent) => {
      // 若点击在菜单内部，或按键不是 Escape，则忽略
      if (
        (e.type === "mousedown" && ref.current?.contains(e.target as Node)) ||
        (e.type === "keydown" && (e as KeyboardEvent).key !== "Escape")
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", handler);
    };
  }, []);

  // 新建页面
  const newPage = async () => {
    const key = await dispatch(createPage()).unwrap();
    navigate(`/${key}?edit=true`);
    setOpen(false);
  };

  // 打开添加分类
  const newCategory = () => {
    setOpen(false);
    setCatOpen(true);
  };

  // 打开创建空间
  const newSpace = () => {
    setOpen(false);
    setSpaceOpen(true);
  };

  return (
    <>
      <style href="create-menu" precedence="medium">{`
        .create-menu {
          position: relative;
          display: inline-block;
        }
        .menu-trigger {
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${theme.space[8]};
          height: ${theme.space[8]};
          border: 1px solid ${theme.border};
          border-radius: ${theme.space[2]};
          background: ${theme.background};
          color: ${theme.textTertiary};
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
          overflow: hidden;
        }
        .menu-trigger::before {
          content: '';
          position: absolute;
          top:0;left:0;right:0;bottom:0;
          background: ${theme.primary};
          opacity: 0;
          transition: opacity 0.2s cubic-bezier(0.4,0,0.2,1);
        }
        .menu-trigger:hover {
          border-color: ${theme.primaryAlpha}40;
          color: ${theme.primary};
          transform: translateY(-1px);
          box-shadow: 0 ${theme.space[1]} ${theme.space[2]} ${theme.shadowLight};
        }
        .menu-trigger:hover::before {
          opacity: 0.04;
        }
        .menu-trigger:active {
          transform: translateY(0);
          transition: transform 0.1s ease;
        }
        .menu-trigger.open {
          border-color: ${theme.primary};
          background: ${theme.primaryAlpha}08;
          color: ${theme.primary};
          box-shadow: 0 ${theme.space[1]} ${theme.space[3]} ${theme.shadowMedium};
        }
        .menu-trigger svg {
          transition: transform 0.2s cubic-bezier(0.4,0,0.2,1);
        }
        .menu-trigger.open svg {
          transform: rotate(45deg);
        }
        .menu-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: ${theme.space[2]};
          background: ${theme.background};
          border: 1px solid ${theme.border};
          border-radius: ${theme.space[2]};
          padding: ${theme.space[1]};
          min-width: 180px;
          box-shadow:
            0 ${theme.space[1]} ${theme.space[3]} ${theme.shadowLight},
            0 ${theme.space[2]} ${theme.space[4]} ${theme.shadowMedium};
          z-index: 1000;
          animation: menuSlideIn 0.15s cubic-bezier(0.4,0,0.2,1);
          transform-origin: top left;
        }
        @keyframes menuSlideIn {
          from {
            opacity: 0;
            transform: translateY(-${theme.space[1]}) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .menu-item {
          display: flex;
          align-items: center;
          padding: ${theme.space[2]} ${theme.space[3]};
          color: ${theme.textSecondary};
          background: transparent;
          border: none;
          width: 100%;
          border-radius: ${theme.space[1]};
          margin: 1px 0;
          cursor: pointer;
          position: relative;
          transition: all 0.15s cubic-bezier(0.4,0,0.2,1);
        }
        .menu-item::before {
          content: '';
          position: absolute;
          inset: 0;
          background: ${theme.primary};
          border-radius: ${theme.space[1]};
          opacity: 0;
          transition: opacity 0.15s cubic-bezier(0.4,0,0.2,1);
        }
        .menu-item:hover {
          color: ${theme.primary};
          background: ${theme.backgroundHover};
          transform: translateX(2px);
        }
        .menu-item:hover::before {
          opacity: 0.06;
        }
        .menu-item:active {
          transform: translateX(1px) scale(0.98);
        }
        .menu-item-icon {
          margin-right: ${theme.space[2]};
          opacity: 0.8;
          transition: opacity 0.15s ease;
        }
        .menu-item:hover .menu-item-icon {
          opacity: 1;
        }
        .menu-item-label {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.1px;
        }
        @media (prefers-color-scheme: dark) {
          .menu-dropdown {
            backdrop-filter: blur(8px);
            background: ${theme.backgroundGhost};
          }
        }
      `}</style>

      <div className="create-menu" ref={ref}>
        <button
          type="button"
          className={`menu-trigger ${open ? "open" : ""}`}
          onClick={() => setOpen((o) => !o)}
          aria-label="创建菜单"
          aria-expanded={open}
        >
          <PlusIcon size={16} />
        </button>

        {open && (
          <div className="menu-dropdown">
            <button className="menu-item" onClick={newPage} type="button">
              <FileAddedIcon size={16} className="menu-item-icon" />
              <span className="menu-item-label">新建页面</span>
            </button>

            <button className="menu-item" onClick={newCategory} type="button">
              <MdCategory size={16} className="menu-item-icon" />
              <span className="menu-item-label">添加分类</span>
            </button>

            <button className="menu-item" onClick={newSpace} type="button">
              <PlusIcon size={16} className="menu-item-icon" />
              <span className="menu-item-label">创建空间</span>
            </button>
          </div>
        )}
      </div>

      <AddCategoryModal
        isOpen={catOpen}
        onClose={() => setCatOpen(false)}
        onAddCategory={(name) => {
          if (name.trim() && spaceId) {
            dispatch(addCategory({ spaceId, name }));
          }
          setCatOpen(false);
        }}
      />

      <Dialog isOpen={spaceOpen} onClose={() => setSpaceOpen(false)}>
        <div onClick={(e) => e.stopPropagation()}>
          <CreateSpaceForm onClose={() => setSpaceOpen(false)} />
        </div>
      </Dialog>
    </>
  );
};
