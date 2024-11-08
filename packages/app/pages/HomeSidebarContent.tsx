// app/pages/HomeSidebarContent.tsx
import React from "react";
import { NavItem } from "auth/navPermissions";
import NavListItem from "render/layout/blocks/NavListItem";
import { allowRule } from "auth/navPermissions";
import { useAuth } from "auth/useAuth";
import { BeakerIcon } from "@primer/octicons-react"; // 引入 BeakerIcon
import { nolotusId } from "core/init"; // 确保引入 nolotusId

const HomeSidebarContent: React.FC = () => {
  const auth = useAuth();

  const bottomLinks: NavItem[] = [
    {
      path: "/lab",
      label: "实验室",
      icon: <BeakerIcon size={16} />,
      allow_users: [nolotusId],
    },
    {
      path: "/download",
      label: "客户端下载",
      icon: <BeakerIcon size={16} />,
    },
    {
      path: "/price",
      label: "价格",
      icon: <BeakerIcon size={16} />,
    },
    {
      path: "/about",
      label: "关于",
      icon: <BeakerIcon size={16} />,
    },
    {
      path: "/help",
      label: "帮助",
      icon: <BeakerIcon size={16} />,
    },
  ];

  const allowedBottomLinks = allowRule(auth?.user, bottomLinks);

  return (
    <ul style={{ listStyleType: "none", padding: 0 }}>
      {allowedBottomLinks.map((item) => (
        <NavListItem key={item.path} {...item} />
      ))}
    </ul>
  );
};

export default HomeSidebarContent;
