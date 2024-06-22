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
    className={`h-12 w-32 flex-1 rounded-lg ${customStyles}`}
    key={route}
    onClick={() => {
      navigate(route);
    }}
  >
    {text}
  </Button>
);
