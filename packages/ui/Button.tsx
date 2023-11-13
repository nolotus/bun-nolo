import { Spinner } from '@primer/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type ButtonProps = {
  className?: string,
  children: React.ReactNode,
  onClick?: () => void,
  width?: string,
  loading?: boolean,
  variant?: 'primary' | 'secondary',
  size?: 'small' | 'medium' | 'large',
  icon?: React.ReactNode,
  disabled?: boolean,
  type?: 'button' | 'submit' | 'reset',
};

export const Button = (props: ButtonProps) => {
  const {
    className,
    children,
    onClick,
    width = 'auto',
    loading = false,
    variant = 'primary',
    size = 'medium',
    icon,
    disabled = false,
    type = 'button',
  } = props;

  const { t } = useTranslation();

  const baseStyles =
    'rounded-sm transition duration-150 inline-flex justify-center  text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';
  const sizeStyles =
    size === 'small'
      ? 'py-1 px-2'
      : size === 'medium'
      ? 'py-2 px-4'
      : 'py-3 px-6';
  const variantStyles =
    variant === 'primary'
      ? 'bg-sky-500 text-white hover:bg-sky-600 focus:ring-sky-500'
      : 'bg-white text-black hover:bg-neutral-100 focus:ring-neutral-400';

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className} ${width}`}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
    >
      {loading && <Spinner size={16} className="mr-2" />}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
