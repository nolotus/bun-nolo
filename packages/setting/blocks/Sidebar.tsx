import { useAuth } from 'app/hooks';
import { nolotusId } from 'core/init';
import React from 'react';
import { Link } from 'react-router-dom';

import { USER_PROFILE_ROUTE, EXTENDED_PROFILE_ROUTE } from '../routes';

const allowedUserIds = [nolotusId];

const navItems = [
  { path: `/settings/${USER_PROFILE_ROUTE}`, label: '个人资料' },
  { path: `/settings/${EXTENDED_PROFILE_ROUTE}`, label: '生活与兴趣' },
  { path: '/settings/network', label: '网络设置' },
  { path: '/settings/sync', label: '同步设置' },
  { path: '/settings/plugins', label: '插件设置' },
  { path: '/settings/import', label: '导入设置' },
  { path: '/settings/export', label: '导出设置' },
  { path: '/settings/account', label: '账号设置' },
  { path: '/settings/service-provider', label: '服务商设置' },
];
const Sidebar: React.FC = () => {
  const auth = useAuth();

  const couldDisplay = (item) => {
    if (item.label === '服务商设置') {
      if (auth.user) {
        if (allowedUserIds.includes(auth.user?.userId)) {
          return true;
        }
      }
      return false;
    }
    return true;
  };
  return (
    <div className="w-64 min-h-screen bg-gray-800 text-white p-6 space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      <nav className="space-y-2">
        <ul>
          {navItems.map((item, index) => {
            const isDisplay = couldDisplay(item);
            return isDisplay ? (
              <li className="rounded" key={index}>
                <Link
                  to={item.path}
                  className="text-gray-300 hover:text-white hover:bg-gray-700 p-2 block rounded transition-colors duration-200 ease-in-out"
                >
                  {item.label}
                </Link>
              </li>
            ) : null;
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
