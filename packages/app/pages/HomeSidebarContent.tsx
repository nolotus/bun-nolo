// app/pages/HomeSidebarContent.tsx
import React from "react";
import { NavItem } from "auth/navPermissions";
import NavListItem from "render/layout/blocks/NavListItem";
import { allowRule } from "auth/navPermissions";
import { useAuth } from "auth/useAuth";
import { DesktopDownloadIcon, PeopleIcon } from "@primer/octicons-react";
import { nolotusId } from "core/init"; // 确保引入 nolotusId
import { ImLab } from "react-icons/im";
import { RiMoneyCnyBoxLine } from "react-icons/ri";
import { MdOutlineHelpCenter } from "react-icons/md";

const HomeSidebarContent: React.FC = () => {
  const auth = useAuth();

  const bottomLinks: NavItem[] = [
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
      path: "/price",
      label: "价格",
      icon: <RiMoneyCnyBoxLine size={20} />,
    },

    {
      path: "/help",
      label: "帮助",
      icon: <MdOutlineHelpCenter size={18} />,
    },
    {
      path: "/about",
      label: "关于",
      icon: <PeopleIcon size={18} />,
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
