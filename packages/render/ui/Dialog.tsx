import React from "react";

import { XIcon } from "@primer/octicons-react";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";

import { Modal } from "./Modal";
import { layout } from "../styles/layout";

export const Dialog = ({ isOpen, onClose, title, children }) => {
  const theme = useSelector(selectTheme);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        style={{
          ...layout.flexColumn,
          background: "#fff",
          height: "auto",
          maxHeight: "90dvh",
          borderRadius: "5px",
        }}
      >
        <div
          style={{
            ...layout.flexBetween,
            padding: `${theme.spacing.large} ${theme.spacing.large}`,
          }}
        >
          <h2
            style={{
              fontSize: theme.fontSize.large,
            }}
          >
            {title}
          </h2>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              userSelect: "none",
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
            ...layout.overflowYAuto,
            padding: theme.spacing.large,
          }}
        >
          {children}
        </div>
      </div>
    </Modal>
  );
};
