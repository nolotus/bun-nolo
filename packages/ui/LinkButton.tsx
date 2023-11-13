import clsx from 'clsx';
import React, { FC } from 'react';
import { Link } from 'react-router-dom';


interface LinkButtonProps {
  to: string;
  icon: React.ReactNode
  label?: string;
  className?: string;
}

export const LinkButton: FC<LinkButtonProps> = ({
  to,
  icon,
  label,
  className,
}) => (
  <Link
    to={to}
    className={clsx('flex items-center', className ? className : '')}
  >
    {icon}
    {label && <span className="ml-2">{label}</span>}
  </Link>
);
