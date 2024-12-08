import React from "react";

import { XIcon } from "@primer/octicons-react";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import { themeStyles } from "render/ui/styles";
import { stylePresets } from "render/styles/stylePresets";

import { Modal } from "./Modal";
import { layout } from "../styles/layout";

export const Dialog = ({ isOpen, onClose, title, children }) => {
  const theme = useSelector(selectTheme);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        style={{
          ...themeStyles.surface1(theme),
          ...layout.flexColumn,
          height: "auto",
          maxHeight: "80dvh",
          borderRadius: theme.borderRadius,
        }}
      >
        <div
          style={{
            ...stylePresets.flexBetween,
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
              ...stylePresets.bgNone,
              ...stylePresets.borderNone,
              ...stylePresets.clickable,
              ...themeStyles.textColor1(theme),
            }}
            onClick={onClose}
            aria-label="Close"
            onMouseEnter={(e) => (e.currentTarget.style.color = theme.brand)}
            onMouseLeave={(e) => (e.currentTarget.style.color = theme.text1)}
          >
            <XIcon />
          </button>
        </div>

        <div
          style={{
            ...stylePresets.overflowYAuto,
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
