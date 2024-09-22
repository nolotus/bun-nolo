import React from "react";
import { Tooltip } from "@primer/react/next";
import { Link } from "react-router-dom";
import { circleButtonStyle } from "render/button/style";

export const CircleButton = ({ tooltip, icon, to, onClick }) => {
  const ButtonContent = (
    <button style={{ ...circleButtonStyle, color: "inherit" }}>{icon}</button>
  );

  return (
    <Tooltip text={tooltip} direction="n">
      {to ? (
        <Link to={to} onClick={onClick} style={{ color: "inherit" }}>
          {ButtonContent}
        </Link>
      ) : (
        <div onClick={onClick}>{ButtonContent}</div>
      )}
    </Tooltip>
  );
};
