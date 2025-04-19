import SpaceLayout from "create/space/components/SpaceLayout";
import SpaceHome from "create/space/pages/SpaceHome";
import SpaceSettings from "create/space/pages/SpaceSettings";
import SpaceMembers from "create/space/pages/SpaceMembers";

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
      element: <SpaceHome />, // 目前与首页相同，之后可以替换为专用文件页面
    },
  ],
};
