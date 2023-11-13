import { XIcon } from '@primer/octicons-react';
import React from 'react';

import NavListItem from './NavListItem';

interface MobileMenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
  navItems: { path: string, label: string, icon?: JSX.Element }[];
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  toggleMenu,
  navItems,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden">
      <div className="px-4 py-2">
        <button onClick={toggleMenu} className="text-white float-right">
          <XIcon size={24} />
        </button>

        <ul className="space-y-2 text-white mt-8">
          {navItems.map((item) => (
            <NavListItem {...item} key={item.path} className="text-white" />
          ))}
        </ul>
      </div>
    </div>
  );
};
