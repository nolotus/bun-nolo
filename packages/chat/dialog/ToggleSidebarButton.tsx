import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@primer/octicons-react";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";

const ToggleSidebarButton = ({ onClick, isOpen }) => {
  const theme = useAppSelector(selectTheme);

  const buttonStyle = {
    width: "28px",
    height: "28px",
    borderRadius: "4px",
    backgroundColor: "transparent",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    marginRight: "12px",
    padding: 0,
    transition: "all 0.2s ease-in-out",
    outline: "none",
  };

  const iconStyle = {
    color: theme.text2,
  };

  return (
    <button
      onClick={onClick}
      style={buttonStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "scale(0.95)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.link}`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {isOpen ? (
        <ChevronLeftIcon size={16} style={iconStyle} />
      ) : (
        <ChevronRightIcon size={16} style={iconStyle} />
      )}
    </button>
  );
};

export default ToggleSidebarButton;
