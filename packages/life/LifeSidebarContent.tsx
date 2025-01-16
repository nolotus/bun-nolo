import type React from "react";
import { GraphIcon, PeopleIcon } from "@primer/octicons-react";
import { allowRule, type NavItem } from "auth/navPermissions";
import NavListItem from "render/layout/blocks/NavListItem";
import { nolotusId } from "core/init";
import { useAuth } from "auth/hooks/useAuth";

const LifeSidebarContent: React.FC = () => {
  const auth = useAuth();
  const links: NavItem[] = [
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
