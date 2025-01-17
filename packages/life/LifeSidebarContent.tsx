import type React from "react";
import { allowRule, type NavItem } from "auth/navPermissions";
import { nolotusId } from "core/init";
import { useAuth } from "auth/hooks/useAuth";

import NavListItem from "render/layout/blocks/NavListItem";
import { GraphIcon, PeopleIcon, DatabaseIcon } from "@primer/octicons-react";

const LifeSidebarContent: React.FC = () => {
  const auth = useAuth();
  const links: NavItem[] = [
    {
      path: "/life/database",
      label: "数据",
      icon: <DatabaseIcon size={20} />,
    },
    {
      path: "/life/usage",
      label: "使用",
      icon: <GraphIcon size={20} />,
    },
    {
      path: "/users",
      label: "用户",
      icon: <PeopleIcon size={20} />,
      allow_users: [nolotusId],
    },
  ];
  const allowedLinks = allowRule(auth?.user, links);
  return (
    <ul style={{ listStyleType: "none", padding: 0 }}>
      {allowedLinks.map((item) => (
        <NavListItem key={item.path} {...item} />
      ))}
    </ul>
  );
};

export default LifeSidebarContent;
