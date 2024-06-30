import React from "react";
import { useTranslation } from "react-i18next";
import { Spinner } from "@primer/react";

export type ButtonProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  width?: string;
  loading?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

export const Button = (props: ButtonProps) => {
  const {
    className,
    style,
    children,
    onClick,
    width = "auto",
    loading = false,
    icon,
    disabled = false,
    type = "button",
  } = props;

  const { t } = useTranslation();

  return (
    <button
      className={` ${className} surface2 text2 ${width}`}
      onMouseDown={onClick}
      disabled={disabled || loading}
      type={type}
      style={style}
    >
      {loading && <Spinner size={"small"} />}
      {icon && !loading && icon}
      {children}
    </button>
  );
};
