import React from "react";
import { Button, ButtonProps } from "./Button";
import { Link, LinkProps } from "./Link";

type ButtonLinkProps = ButtonProps &
  LinkProps & {
    iconPosition?: "left" | "right";
  };

export const ButtonLink = ({
  to,
  onClick,
  icon,
  iconPosition = "left",
  ...props
}: ButtonLinkProps) => {
  const button = (
    <Button onClick={onClick} icon={icon} {...props}>
      {props.children}
    </Button>
  );

  const content =
    iconPosition === "left" ? (
      <>
        {icon}
        {button}
      </>
    ) : (
      <>
        {button}
        {icon}
      </>
    );

  return <Link to={to}>{content}</Link>;
};
