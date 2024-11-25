import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NavListItem from "./blocks/NavListItem";
import { HomeIcon, CommentDiscussionIcon } from "@primer/octicons-react";
import { CreateWorkSpaceButton } from "create/workspace/CreateWorkSpaceButton";
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
import { useAuth } from "auth/useAuth";

export const SidebarTop = () => {
  const { isLoggedIn } = useAuth();

  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const workspaces = useAppSelector(selectAllWorkspaces);
  const navigate = useNavigate();
  const currentWorkspaceName = useAppSelector(selectCurrentWorkspaceName);
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, []);

  const getCurrentWorkspaceName = () => {
    if (!currentWorkspaceName) return t("selectWorkspace");
    return currentWorkspaceName === "allChats"
      ? t("allChats")
      : currentWorkspaceName;
  };

  const handleOptionClick = (workspaceId: string) => {
    navigate("/chat");
    dispatch(changeWorkSpace(workspaceId));
    dispatch(queryDialogList(workspaceId));
    setIsOpen(false);
  };
  const handleDeleteWorkspace = (workspaceId: string) => {
    dispatch(deleteWorkspace(workspaceId));
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px",
        justifyContent: "space-between",
      }}
    >
      <NavListItem path="/" icon={<HomeIcon size={24} />} />
      {isLoggedIn && (
        <>
          <NavListItem
            path="/chat"
            icon={<CommentDiscussionIcon size={24} />}
          />
          <div
            style={{
              position: "relative",
              width: "120px",
            }}
          >
            <div
              onClick={() => setIsOpen(!isOpen)}
              style={{
                padding: "10px 6px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  color: "#3c4043",
                }}
              >
                {getCurrentWorkspaceName()}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              >
                <RxDropdownMenu size={16} />
              </span>
            </div>

            {isOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  right: 0,
                  background: "white",
                  border: "1px solid #dfe1e5",
                  borderRadius: "8px",
                  maxHeight: "300px",
                  overflowY: "auto",
                  zIndex: 1000,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  onClick={() => handleOptionClick()}
                  onMouseEnter={() => setHoveredItem()}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    background: hoveredItem === "all" ? "#f1f3f4" : "white",
                    transition: "background 0.2s ease",
                    borderRadius: "8px 8px 0 0",
                    fontSize: "14px",
                    color: "#3c4043",
                  }}
                >
                  {t("recent")}
                </div>

                {workspaces &&
                  workspaces.map((workspace: any) => (
                    <div
                      key={workspace.id}
                      onClick={() => handleOptionClick(workspace.id)}
                      onMouseEnter={() => setHoveredItem(workspace.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      style={{
                        padding: "10px 14px",
                        cursor: "pointer",
                        background:
                          hoveredItem === workspace.id ? "#f1f3f4" : "white",
                        transition: "background 0.2s ease",
                        fontSize: "14px",
                        color: "#3c4043",
                        borderTop: "1px solid #f1f3f4",
                      }}
                    >
                      {workspace.name}
                      <button
                        onClick={() => handleDeleteWorkspace(workspace.id)}
                      >
                        删除
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
      )}
      <div style={{ marginLeft: "0px" }}>
        <CreateWorkSpaceButton />
      </div>
    </div>
  );
};
