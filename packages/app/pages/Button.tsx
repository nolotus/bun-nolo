import React, { useState } from "react";
import { useSelector } from "react-redux";
import OpenProps from "open-props";
import { selectTheme, selectIsDarkMode } from "../theme/themeSlice";

const Button = ({ type, disabled, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  const theme = useSelector(selectTheme);
  const isDarkMode = useSelector(selectIsDarkMode);

  const baseStyles = {
    alignItems: "center",
    background: isDarkMode ? theme.surface1 : "#fff",
    border: `${OpenProps.borderSize2} solid ${theme.surface3}`,
    borderRadius: theme.borderRadius,
    boxShadow: `${OpenProps.shadow2}, 0 1px ${theme.surface3}, 0 0 0 ${isHovered ? OpenProps.size2 : "0"} ${isDarkMode ? theme.surface4 : theme.surface2}`,
    color: theme.text2,
    display: "inline-flex",
    fontSize: theme.fontSize.medium,
    fontWeight: OpenProps.fontWeight7,
    gap: theme.spacing.small,
    justifyContent: "center",
    paddingBlock: "0.75ch",
    paddingInline: theme.spacing.large,
    textAlign: "center",
    textShadow: `0 1px 0 ${theme.surface3}`,
    transition: `border-color 0.5s ${OpenProps.ease3}, box-shadow 145ms ${OpenProps.ease4}`,
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    WebkitTouchCallout: "none",
  };

  const disabledStyles = {
    background: "none",
    color: theme.text2,
    boxShadow: OpenProps.shadow1,
    cursor: "not-allowed",
  };

  const typeStyles = {
    submit: {
      color: theme.link,
    },
    reset: {
      color: OpenProps.red6,
      borderColor: OpenProps.red3,
    },
  };

  const combinedStyles = {
    ...baseStyles,
    ...(typeStyles[type] || {}),
    ...(disabled ? disabledStyles : {}),
  };

  return (
    <button
      type={type}
      disabled={disabled}
      style={combinedStyles}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => !disabled && setIsHovered(false)}
    >
      {children}
    </button>
  );
};

export default Button;
