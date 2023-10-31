import React from 'react';
import { useTranslation } from 'react-i18next';

export type ButtonProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  width?: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  disabled?: boolean;
  type?;
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
    type,
  } = props;

  const { t } = useTranslation();

  const baseStyles =
    'rounded transition duration-150 inline-flex justify-center border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';
  const sizeStyles =
    size === 'small'
      ? 'py-1 px-2'
      : size === 'medium'
      ? 'py-2 px-4'
      : 'py-3 px-6';
  const variantStyles =
    variant === 'primary'
      ? 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400'
      : 'bg-white text-black hover:bg-gray-100 focus:ring-gray-400';

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className} ${width}`}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {t('submitting')}
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
