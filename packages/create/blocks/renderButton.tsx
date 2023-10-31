import React from 'react';
import { Button } from 'ui/Button';

type RenderButtonProps = {
  text: string,
  route: string,
  navigate: (route: string) => void,
  customStyles?: string,
};

export const renderButton: React.FC<RenderButtonProps> = ({
  text,
  route,
  navigate,
  customStyles = '',
}) => (
  <Button
    className={`flex-1 rounded-lg w-32 h-12 ${customStyles}`}
    key={route}
    onClick={() => {
      navigate(route);
    }}
  >
    {text}
  </Button>
);
