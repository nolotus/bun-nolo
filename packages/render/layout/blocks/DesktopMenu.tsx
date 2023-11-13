import React from 'react';

import NavListItem from './NavListItem';

interface DesktopMenuProps {
  navItems: { path: string, label: string, icon?: JSX.Element }[];
}

export const DesktopMenu: React.FC<DesktopMenuProps> = ({ navItems }) => {
  return (
    <ul className="hidden lg:flex space-x-4">
      {navItems.map((item) => (
        <NavListItem {...item} key={item.path} />
      ))}
    </ul>
  );
};
