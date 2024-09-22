// render/button/CircleButton.jsx

import React from "react";
import { Link } from "react-router-dom";
import { Tooltip } from "@primer/react/next";
import { circleButtonStyle } from "./style";

export const CircleButton = ({ tooltip, icon, to, onClick }) => {
  const buttonStyle = {
    ...circleButtonStyle,
    color: "inherit",
  };

  const iconStyle = {
    color: "#24292e", // 可以根据需要调整颜色
  };

  const content = (
    <button
      style={buttonStyle}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick(e);
      }}
    >
      <span style={iconStyle}>
        {React.cloneElement(icon, { style: iconStyle, size: 24 })}
      </span>
    </button>
  );

  return (
    <Tooltip text={tooltip} direction="w">
      {to ? (
        <Link to={to} style={{ textDecoration: "none", color: "inherit" }}>
          {content}
        </Link>
      ) : (
        content
      )}
    </Tooltip>
  );
};
