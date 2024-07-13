// CircleButton.js
import React from "react";
import { Tooltip } from "@primer/react/next";
import { circleButtonStyle } from "render/button/style";

export const CircleButton = ({ tooltip, icon, onClick }) => {
  return (
    <Tooltip text={tooltip} direction="n">
      <button style={circleButtonStyle} onClick={onClick}>
        {icon}
      </button>
    </Tooltip>
  );
};
