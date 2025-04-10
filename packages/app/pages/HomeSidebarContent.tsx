// app/pages/HomeSidebarContent.tsx
import { DesktopDownloadIcon } from "@primer/octicons-react";
import type { NavItem } from "auth/navPermissions";
import { allowRule } from "auth/navPermissions";
import { useAuth } from "auth/hooks/useAuth";
import { nolotusId } from "core/init";
import type React from "react";
import { ImLab } from "react-icons/im";
import { MdOutlineHelpCenter } from "react-icons/md";
import { RiMoneyCnyBoxLine } from "react-icons/ri";
import NavListItem from "render/layout/blocks/NavListItem";

const HomeSidebarContent: React.FC = () => {
  const auth = useAuth();

  const links: NavItem[] = [
    {
      path: "/lab",
      label: "实验室",
      icon: <ImLab size={18} />,
      allow_users: [nolotusId],
    },
    {
      path: "/download",
      label: "客户端下载",
      icon: <DesktopDownloadIcon size={16} />,
    },
    {
      path: "/pricing",
      label: "价格",
      icon: <RiMoneyCnyBoxLine size={20} />,
    },
    {
      path: "/help",
      label: "帮助",
      icon: <MdOutlineHelpCenter size={18} />,
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

export default HomeSidebarContent;
