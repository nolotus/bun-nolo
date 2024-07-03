import React from "react";
import { Button } from "render/ui/Button";

type RenderButtonProps = {
  text: string;
  route: string;
  navigate: (route: string) => void;
  customStyles?: string;
};

export const renderButton: React.FC<RenderButtonProps> = ({
  text,
  route,
  navigate,
  customStyles = "",
}) => (
  <Button
    className={`${customStyles}`}
    key={route}
    onClick={() => {
      navigate(route);
    }}
  >
    {text}
  </Button>
);
