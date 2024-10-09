import React from "react";
import {
  HomeIcon,
  PlusIcon,
  CommentDiscussionIcon,
} from "@primer/octicons-react";

export interface NavItem {
  path: string;
  label: string;
  icon?: JSX.Element;
  allow_users?: string[];
}

export const fixedLinks: NavItem[] = [
  { path: "/", label: "Home", icon: <HomeIcon size={16} /> },
  { path: "/create", label: "Add", icon: <PlusIcon size={16} /> },
  { path: "/chat", label: "Chat", icon: <CommentDiscussionIcon size={16} /> },
];

export const allowRule = (user, navItems: NavItem[]) => {
  return user
    ? navItems.filter((item) => {
        if (!item.allow_users) {
          return true;
        }
        return item.allow_users.includes(user.userId);
      })
    : navItems;
};
