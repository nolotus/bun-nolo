import clsx from 'clsx';
import React, { CSSProperties } from 'react';
import { NavLink } from 'react-router-dom';

export interface LinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  target?: '_blank' | '_self' | '_parent' | '_top';
}

export const Link: React.FC<LinkProps> = ({
  to,
  children,
  className = '',
  style = {},
  target = '_blank',
}) => {
  const baseStyle = 'text-sky-500 hover:text-sky-700';
  const activeStyle = 'text-sky-700';

  return (
    <NavLink
      to={to}
      style={style}
      target={target}
      className={({ isActive }: { isActive: boolean }) =>
        clsx(isActive ? activeStyle : baseStyle, className)
      }
    >
      {children}
    </NavLink>
  );
};
