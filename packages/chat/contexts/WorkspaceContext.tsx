// chat/contexts/WorkspaceContext.tsx

import React, { createContext, useContext, useState, useCallback } from "react";

interface Workspace {
  id: string;
  name: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace) => void;
  moveEntityToWorkspace: (
    entityId: string,
    entityType: string,
    workspaceId: string,
  ) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
);

export const WorkspaceProvider: React.FC = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    { id: "default", name: "Default Workspace" },
    { id: "work", name: "Work" },
    { id: "personal", name: "Personal" },
  ]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    workspaces[0],
  );

  const moveEntityToWorkspace = useCallback(
    async (entityId: string, entityType: string, workspaceId: string) => {
      try {
        // 这里实现移动实体到新工作区的逻辑
        console.log(
          `Moving ${entityType} ${entityId} to workspace ${workspaceId}`,
        );

        // 调用 API 来更新后端数据
        // const response = await api.moveEntityToWorkspace(entityId, entityType, workspaceId);

        // 如果需要，更新本地状态
        // updateLocalState(entityId, entityType, workspaceId);

        // 如果操作成功，可能需要触发一些更新或通知
        // onMoveSuccess(entityId, entityType, workspaceId);
      } catch (error) {
        console.error("Failed to move entity to workspace:", error);
        // 处理错误，可能需要显示一个错误通知
        // onMoveError(error);
      }
    },
    [],
  );

  const value = {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    moveEntityToWorkspace,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
