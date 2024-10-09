import { XIcon } from "@primer/octicons-react";
import React from "react";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";

import { Modal } from "./Modal";

export const Dialog = ({ isOpen, onClose, title, children }) => {
  const theme = useSelector(selectTheme);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        style={{
          backgroundColor: theme.surface1,
          height: "auto",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: theme.borderRadius,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `${theme.spacing.large} ${theme.spacing.large}`,
          }}
        >
          <h2 style={{ color: theme.text1, fontSize: theme.fontSize.large }}>
            {title}
          </h2>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: theme.text1,
            }}
            onClick={onClose}
            aria-label="Close"
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = theme.primaryColor)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = theme.textColor)
            }
          >
            <XIcon />
          </button>
        </div>

        <div
          style={{
            overflow: "auto",
            padding: theme.spacing.large,
            color: theme.text1,
          }}
        >
          {children}
        </div>
      </div>
    </Modal>
  );
};
