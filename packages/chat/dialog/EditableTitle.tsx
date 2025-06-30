import { useAppSelector } from "app/store";
import { selectTheme } from "app/settings/settingSlice";
import React from "react";

const EditableTitle = ({ currentDialogConfig }) => {
  const theme = useAppSelector(selectTheme);
  const title = currentDialogConfig.title;

  const titleContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    maxWidth: "100%",
  };

  const dialogTitleStyle = {
    margin: 0,
    fontSize: "16px",
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: theme.text,
  };

  return (
    <div style={titleContainerStyle}>
      <h1 style={dialogTitleStyle}>{title}</h1>
    </div>
  );
};

export default React.memo(EditableTitle);
