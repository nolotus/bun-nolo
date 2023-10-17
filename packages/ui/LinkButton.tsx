import React, { FC } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { Icon, iconMap } from "./Icon";

interface LinkButtonProps {
  to: string;
  icon: keyof typeof iconMap;
  label?: string;
  extraClass?: string;
  iconClass?: string;
}

export const LinkButton: FC<LinkButtonProps> = ({
  to,
  icon,
  label,
  extraClass,
  iconClass,
}) => (
  <Link
    to={to}
    className={clsx("flex items-center", extraClass ? extraClass : "")}
  >
    <Icon name={icon} className={clsx("w-8 h-8", iconClass ? iconClass : "")} />
    {label && <span className="ml-2">{label}</span>}
  </Link>
);
