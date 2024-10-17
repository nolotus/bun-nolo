export interface NavItem {
  path: string;
  label: string;
  icon?: JSX.Element;
  allow_users?: string[];
}

export const allowRule = (user, navItems: NavItem[]) => {
  return user
    ? navItems.filter((item) => {
        if (!item.allow_users) {
          return true;
        }
        return item.allow_users.includes(user.userId);
      })
    : navItems.filter((item) => !item.allow_users);
};
