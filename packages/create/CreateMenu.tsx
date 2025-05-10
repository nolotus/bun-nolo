import {
  flip,
  offset,
  shift,
  useFloating,
  useHover,
  useInteractions,
} from "@floating-ui/react";
import {
  DependabotIcon,
  FileAddedIcon,
  PlusIcon,
} from "@primer/octicons-react";
import { MdCategory } from "react-icons/md"; // 从 react-icons 引入一个更合适的分类图标
import { useAuth } from "auth/hooks/useAuth";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { CreateRoutePaths } from "create/routePaths";
import { useTheme } from "app/theme";
import { useAppDispatch, useAppSelector } from "app/hooks"; // 增加 useAppSelector 导入
import { createPage } from "render/page/pageSlice";
import { addCategory } from "create/space/spaceSlice";
import { selectCurrentSpaceId } from "create/space/spaceSlice"; // 导入选择器以获取 spaceId
import { AddCategoryModal } from "create/space/category/AddCategoryModal"; // 更新导入路径

export const CreateMenu = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false); // 控制添加分类弹窗
  const { t } = useTranslation();
  const theme = useTheme();

  // 从状态中获取当前空间 ID
  const spaceId = useAppSelector(selectCurrentSpaceId);

  const createNewPage = async () => {
    const dbkey = await dispatch(createPage()).unwrap();
    navigate(`/${dbkey}?edit=true`);
    setIsOpen(false);
  };

  // 处理添加分类逻辑
  const handleAddCategory = () => {
    setIsAddCategoryModalOpen(true);
    setIsOpen(false); // 关闭下拉菜单
  };

  const handleCloseCategoryModal = () => {
    setIsAddCategoryModalOpen(false);
  };

  // 修改 handleAddCategoryConfirm，传入 spaceId 和 name
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

  const buttonItems = [
    {
      tooltip: "新建页面",
      icon: <FileAddedIcon size={16} />,
      onClick: createNewPage,
    },
    {
      tooltip: "添加Cybot",
      icon: <DependabotIcon size={16} />,
      path: `/${CreateRoutePaths.CREATE_CYBOT}`,
    },
    {
      tooltip: "添加分类",
      icon: <MdCategory size={16} />, // 使用 react-icons 中的 MdCategory 图标
      onClick: handleAddCategory, // 调用添加分类的处理函数
    },
  ];

  const { x, y, strategy, refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(8), flip(), shift()],
  });

  const hover = useHover(context, {
    delay: { open: 0, close: 100 },
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  return (
    <>
      <style href="create-menu" precedence="medium">
        {`
			.create-menu {
			  position: relative;
			}

			.menu-button {
			  display: flex;
			  align-items: center;
			  justify-content: center;
			  width: 30px;
			  height: 30px;
			  border-radius: 4px;
			  border: 1px solid ${theme.border};
			  background: transparent;
			  color: ${theme.textSecondary};
			  cursor: pointer;
			  transition: all 0.2s ease;
			}
	  
			.menu-button:hover {
			  color: ${theme.primary};
			  border-color: ${theme.primary}80;
			  background: ${theme.backgroundSecondary}40;
			}
	  
			.menu-button svg {
			  transition: transform 0.2s ease;
			}
	  
			.menu-button.open svg {
			  transform: rotate(45deg);
			}
	  
			.dropdown {
			  background: ${theme.background}; 
			  border: 1px solid ${theme.border};
			  border-radius: 4px;
			  padding: 4px;
			  min-width: 160px;
			  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
			}
	  
			.menu-item {
			  display: flex;
			  align-items: center;
			  padding: 6px 10px;
			  color: ${theme.textSecondary};
			  text-decoration: none;
			  border-radius: 3px;
			  transition: all 0.15s ease;
			  margin: 1px 0;
			}
	  
			.menu-item:hover {
			  background: ${theme.backgroundSecondary}30;
			  color: ${theme.primary};
			}
	  
			.menu-item svg {
			  margin-right: 8px;
			  flex-shrink: 0;
			  opacity: 0.8;
			}
	  
			.menu-item span {
			  font-size: 13px;
			  font-weight: 400;
			  letter-spacing: 0.1px;
			}
		  `}
      </style>

      <div className="create-menu">
        <button
          ref={refs.setReference}
          className={`menu-button ${isOpen ? "open" : ""}`}
          {...getReferenceProps()}
        >
          <PlusIcon size={16} />
        </button>

        {isOpen && (
          <div
            className="dropdown"
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              zIndex: 1000,
            }}
            {...getFloatingProps()}
          >
            {buttonItems.map((item, index) =>
              item.path ? (
                <Link
                  key={index}
                  to={item.path}
                  className="menu-item"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  <span>{item.tooltip}</span>
                </Link>
              ) : (
                <div
                  key={index}
                  className="menu-item"
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                >
                  {item.icon}
                  <span>{item.tooltip}</span>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* 添加分类的弹窗，复用 AddCategoryModal 组件 */}
      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        onAddCategory={handleAddCategoryConfirm}
      />
    </>
  );
};
