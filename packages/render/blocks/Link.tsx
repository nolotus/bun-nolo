import clsx from 'clsx';
import React, { CSSProperties } from 'react';
import { NavLink } from 'react-router-dom';

export interface LinkProps {
  to?: string;
  href?: string;
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  target?: '_blank' | '_self' | '_parent' | '_top';
}

const Link: React.FC<LinkProps> = ({
  to,
  href,
  children,
  className = '',
  style = {},
  target = '_blank',
}) => {
  const baseStyle = 'text-blue-500 hover:text-blue-700';
  const activeStyle = 'text-green-700';
  if (to) {
    return (
      <NavLink
        to={to}
        style={style}
        className={({ isActive }: { isActive: boolean }) =>
          clsx(isActive ? activeStyle : baseStyle, className)
        }
      >
        {children}
      </NavLink>
    );
  }

  return (
    <a
      href={href}
      style={style}
      target={target}
      className={clsx(baseStyle, className)}
    >
      {children}
    </a>
  );
};
export default Link;
