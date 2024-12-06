import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NavListItem from "./blocks/NavListItem";
import { CommentDiscussionIcon } from "@primer/octicons-react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import {
  changeWorkSpace,
  fetchWorkspaces,
  deleteWorkspace,
  selectAllWorkspaces,
  selectCurrentWorkspaceName,
  queryDialogList,
} from "create/workspace/workspaceSlice";
import { RxDropdownMenu } from "react-icons/rx";
import { GoPlus } from "react-icons/go";
import { useModal } from "render/ui/Modal";
import { Dialog } from "render/ui/Dialog";
import { CreateWorkSpaceForm } from "create/workspace/CreateWorkSpaceForm";
import { themeStyles } from "../ui/styles";
import { selectTheme } from "app/theme/themeSlice";
import { stylePresets } from "render/ui/stylePresets";

export const SidebarTop = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const workspaces = useAppSelector(selectAllWorkspaces);
  const navigate = useNavigate();
  const currentWorkspaceName = useAppSelector(selectCurrentWorkspaceName);
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { visible, open, close } = useModal();
  const theme = useAppSelector(selectTheme);
  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  const getCurrentWorkspaceName = () => {
    if (!currentWorkspaceName) return t("selectWorkspace");
    return currentWorkspaceName === "allChats"
      ? t("allChats")
      : currentWorkspaceName;
  };

  const handleOptionClick = (workspaceId?: string) => {
    navigate("/chat");
    dispatch(changeWorkSpace(workspaceId));
    dispatch(queryDialogList(workspaceId));
    setIsOpen(false);
  };

  const handleDeleteWorkspace = (workspaceId: string) => {
    dispatch(deleteWorkspace(workspaceId));
  };
  const [dropdownHover, setDropdownHover] = useState(false);
  const [createHover, setCreateHover] = useState(false);
  const getHoverStyle = (isHovered: boolean) => ({
    background: isHovered ? theme.surface3 : theme.surface1, // 使用surface3提高对比度
    transform: isHovered ? "translateX(4px)" : "translateX(0)", // 添加轻微位移效果
    borderRadius: "6px",
  });

  return (
    <div style={{ ...stylePresets.flexStart, ...stylePresets.p2 }}>
      <NavListItem path="/chat" icon={<CommentDiscussionIcon size={24} />} />
      <div style={{ ...stylePresets.width160, position: "relative" }}>
        {/* 下拉触发器 */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setDropdownHover(true)}
          onMouseLeave={() => setDropdownHover(false)}
          style={{
            ...stylePresets.flexBetween,
            ...stylePresets.p2,
            ...stylePresets.rounded,
            ...stylePresets.clickable,
            ...stylePresets.transition,
            ...themeStyles.surface1(theme),
            background:
              isOpen || dropdownHover ? theme.surface3 : theme.surface1,
            boxShadow:
              isOpen || dropdownHover ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
          }}
        >
          <span
            style={{
              ...stylePresets.textEllipsis,
              ...stylePresets.fontSize14,
              ...stylePresets.fontWeight500,
              ...themeStyles.textColor1(theme),
            }}
          >
            {getCurrentWorkspaceName()}
          </span>
          <span
            style={{
              ...stylePresets.transition,
              marginLeft: "8px",
              ...themeStyles.textColor2(theme),
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <RxDropdownMenu size={16} />
          </span>
        </div>

        {/* 下拉菜单 */}
        {isOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)", // 稍微增加间距
              left: 0,
              right: 0,
              ...stylePresets.rounded,
              ...stylePresets.overflowYAuto,
              ...themeStyles.surface1(theme),
              maxHeight: "320px",
              zIndex: stylePresets.zIndex3.zIndex,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)", // 更明显的阴影
              border: `1px solid ${theme.surface2}`,
            }}
          >
            {/* 最近会话选项 */}
            <div
              onClick={() => handleOptionClick()}
              onMouseEnter={() => setHoveredItem("all")}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                ...stylePresets.p2,
                ...stylePresets.clickable,
                ...stylePresets.fontSize14,
                ...stylePresets.transition,
                ...themeStyles.textColor1(theme),
                ...getHoverStyle(hoveredItem === "all"),
                margin: "4px",
              }}
            >
              {t("recent")}
            </div>

            {/* 工作区列表 */}
            {workspaces?.map((workspace: any) => (
              <div
                key={workspace.id}
                style={{
                  margin: "4px",
                  borderTop: `1px solid ${theme.surface2}`,
                }}
              >
                <div
                  onClick={() => handleOptionClick(workspace.id)}
                  onMouseEnter={() => setHoveredItem(workspace.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{
                    ...stylePresets.flexBetween,
                    ...stylePresets.p2,
                    ...stylePresets.fontSize14,
                    ...stylePresets.transition,
                    ...themeStyles.textColor1(theme),
                    ...getHoverStyle(hoveredItem === workspace.id),
                  }}
                >
                  <span style={stylePresets.textEllipsis}>
                    {workspace.name}
                  </span>
                  {hoveredItem === workspace.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWorkspace(workspace.id);
                      }}
                      style={{
                        ...stylePresets.buttonBase,
                        ...stylePresets.bgNone,
                        ...stylePresets.borderNone,
                        padding: "4px 8px",
                        fontSize: "12px",
                        color: theme.text2,
                        background: theme.surface4,
                        borderRadius: "4px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {t("删除")}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* 新建工作区按钮 */}
            <div
              style={{
                margin: "4px",
                borderTop: `1px solid ${theme.surface2}`,
              }}
            >
              <div
                style={{
                  ...stylePresets.p2,
                  ...stylePresets.flexStart,
                  ...stylePresets.clickable,
                  ...stylePresets.transition,
                  ...getHoverStyle(createHover),
                  color: theme.brand, // 使用主题的品牌色
                }}
                onMouseEnter={() => setCreateHover(true)}
                onMouseLeave={() => setCreateHover(false)}
                onClick={(e) => {
                  e.stopPropagation();
                  open();
                  setIsOpen(false);
                }}
              >
                <GoPlus
                  size={16}
                  style={{
                    marginRight: "8px",
                  }}
                />
                <span
                  style={{
                    ...stylePresets.fontSize14,
                    fontWeight: 500,
                  }}
                >
                  {t("新建工作区")}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog isOpen={visible} onClose={close}>
        <CreateWorkSpaceForm onClose={close} />
      </Dialog>
    </div>
  );
};
