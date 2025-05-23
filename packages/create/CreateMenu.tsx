import { FileAddedIcon, PlusIcon } from "@primer/octicons-react";
import { MdCategory } from "react-icons/md";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "app/theme";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { createPage } from "render/page/pageSlice";
import { addCategory } from "create/space/spaceSlice";
import { selectCurrentSpaceId } from "create/space/spaceSlice";
import { AddCategoryModal } from "create/space/category/AddCategoryModal";

export const CreateMenu = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const { t } = useTranslation();
  const theme = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 从状态中获取当前空间 ID
  const spaceId = useAppSelector(selectCurrentSpaceId);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // ESC 键关闭菜单
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const createNewPage = async () => {
    const dbkey = await dispatch(createPage()).unwrap();
    navigate(`/${dbkey}?edit=true`);
    setIsOpen(false);
  };

  const handleAddCategory = () => {
    setIsAddCategoryModalOpen(true);
    setIsOpen(false);
  };

  const handleCloseCategoryModal = () => {
    setIsAddCategoryModalOpen(false);
  };

  const handleAddCategoryConfirm = (name: string) => {
    if (name.trim()) {
      if (!spaceId) {
        console.error("无法添加分类：未找到当前空间ID");
        alert("无法添加分类，因为当前空间未设定。");
        return;
      }
      dispatch(addCategory({ spaceId, name }));
      setIsAddCategoryModalOpen(false);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    {
      label: "新建页面",
      icon: <FileAddedIcon size={16} />,
      onClick: createNewPage,
    },
    {
      label: "添加分类",
      icon: <MdCategory size={16} />,
      onClick: handleAddCategory,
    },
  ];

  return (
    <>
      <style href="create-menu" precedence="medium">
        {`
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
           transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
           position: relative;
           overflow: hidden;
         }

         .menu-trigger::before {
           content: '';
           position: absolute;
           top: 0;
           left: 0;
           right: 0;
           bottom: 0;
           background: ${theme.primary};
           opacity: 0;
           transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
           position: relative;
           z-index: 1;
           transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
           padding: ${theme.space[1]} ${theme.space[1]};
           min-width: 180px;
           box-shadow: 
             0 ${theme.space[1]} ${theme.space[3]} ${theme.shadowLight},
             0 ${theme.space[2]} ${theme.space[4]} ${theme.shadowMedium};
           z-index: 1000;
           transform-origin: top left;
           animation: menuSlideIn 0.15s cubic-bezier(0.4, 0, 0.2, 1);
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
           text-decoration: none;
           border-radius: ${theme.space[1]};
           transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
           cursor: pointer;
           position: relative;
           background: transparent;
           border: none;
           width: 100%;
           margin: 1px 0;
         }

         .menu-item::before {
           content: '';
           position: absolute;
           top: 0;
           left: 0;
           right: 0;
           bottom: 0;
           background: ${theme.primary};
           border-radius: ${theme.space[1]};
           opacity: 0;
           transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
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
           transition: transform 0.1s ease;
         }

         .menu-item-icon {
           margin-right: ${theme.space[2]};
           flex-shrink: 0;
           opacity: 0.8;
           position: relative;
           z-index: 1;
           transition: opacity 0.15s ease;
         }

         .menu-item:hover .menu-item-icon {
           opacity: 1;
         }

         .menu-item-label {
           font-size: 13px;
           font-weight: 500;
           letter-spacing: 0.1px;
           position: relative;
           z-index: 1;
         }

         /* 针对暗色模式的优化 */
         @media (prefers-color-scheme: dark) {
           .menu-dropdown {
             backdrop-filter: blur(8px);
             background: ${theme.backgroundGhost};
           }
         }
        `}
      </style>

      <div className="create-menu" ref={menuRef}>
        <button
          ref={buttonRef}
          className={`menu-trigger ${isOpen ? "open" : ""}`}
          onClick={toggleMenu}
          aria-label="创建菜单"
          aria-expanded={isOpen}
        >
          <PlusIcon size={16} />
        </button>

        {isOpen && (
          <div className="menu-dropdown">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className="menu-item"
                onClick={item.onClick}
                type="button"
              >
                <span className="menu-item-icon">{item.icon}</span>
                <span className="menu-item-label">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        onAddCategory={handleAddCategoryConfirm}
      />
    </>
  );
};
