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
      className={` ${className} ${width}`}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
    >
      {loading && <Spinner size={"small"} />}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
