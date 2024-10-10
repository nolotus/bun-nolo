import { XIcon } from "@primer/octicons-react";
import React from "react";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import { styles, themeStyles } from "render/ui/styles";

import { Modal } from "./Modal";

export const Dialog = ({ isOpen, onClose, title, children }) => {
  const theme = useSelector(selectTheme);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        style={{
          ...themeStyles.surface1(theme),
          ...styles.flexColumn,
          height: "auto",
          maxHeight: "80vh",
          borderRadius: theme.borderRadius,
        }}
      >
        <div
          style={{
            ...styles.flexBetween,
            padding: `${theme.spacing.large} ${theme.spacing.large}`,
          }}
        >
          <h2
            style={{
              ...themeStyles.textColor1(theme),
              fontSize: theme.fontSize.large,
            }}
          >
            {title}
          </h2>
          <button
            style={{
              ...styles.bgNone,
              ...styles.borderNone,
              ...styles.clickable,
              ...themeStyles.textColor1(theme),
            }}
            onClick={onClose}
            aria-label="Close"
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = theme.accentColor)
            }
            onMouseLeave={(e) => (e.currentTarget.style.color = theme.text1)}
          >
            <XIcon />
          </button>
        </div>

        <div
          style={{
            ...styles.overflowYAuto,
            padding: theme.spacing.large,
            ...themeStyles.textColor1(theme),
          }}
        >
          {children}
        </div>
      </div>
    </Modal>
  );
};
