import SpaceLayout from "create/space/components/SpaceLayout";
import SpaceHome from "create/space/pages/SpaceHome";
import SpaceSettings from "create/space/pages/SpaceSettings";
import SpaceMembers from "create/space/pages/SpaceMembers";
import SpaceFiles from "create/space/pages/SpaceFiles";

export const spaceRoutes = {
  path: "space/:spaceId",
  element: <SpaceLayout />,
  children: [
    {
      index: true,
      element: <SpaceHome />,
    },
    {
      path: "settings",
      element: <SpaceSettings />,
    },
    {
      path: "members",
      element: <SpaceMembers />,
    },
    {
      path: "files",
      element: <SpaceFiles />, // 使用新的 SpaceFiles 组件
    },
  ],
};
