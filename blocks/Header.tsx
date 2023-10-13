import React, {useState, useEffect, useCallback} from 'react';
import clsx from 'clsx';
import NavListItem from './NavListItem';

import {GoUser} from '../../user/blocks/GoUser';
import nav from '../../../third/nolotus/nav.json';
import {Icon} from '../../../ui';

export const Header: React.FC = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setIsSticky(window.pageYOffset > 0);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(prevState => !prevState);
  }, []);

  return (
    <header
      className={clsx('bg-white z-10', {
        'fixed top-0 left-0 right-0 bg-gray-200 shadow-md': isSticky,
      })}>
      <div className="container mx-auto px-4 lg:px-10">
        <div className="flex justify-between items-center py-2">
          <button onClick={handleMobileMenuToggle} className="lg:hidden">
            <Icon name="navi" />
          </button>
          <ul className="hidden lg:flex space-x-4">
            {nav.map(item => (
              <NavListItem key={item.path} {...item} className="text-black" />
            ))}
          </ul>

          <div className="flex items-center">
            <GoUser />
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden">
          <div className="px-4 py-2">
            <button
              onClick={handleMobileMenuToggle}
              className="text-white float-right">
              <Icon name="close" />
            </button>

            <ul className="space-y-2 text-white mt-8">
              {nav.map(item => (
                <NavListItem key={item.path} {...item} className="text-white" />
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
};
