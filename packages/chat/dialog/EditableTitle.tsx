import React, { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PencilIcon, CheckIcon, XIcon } from "@primer/octicons-react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { patchData } from "database/dbSlice";
import { selectTheme } from "app/theme/themeSlice";

const EditableTitle = ({ currentDialogConfig, allowEdit }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);

  const [isEditing, setEditing] = useState(false);
  const [title, setTitle] = useState(
    currentDialogConfig.title || t("newDialog"),
  );
  const editInputRef = useRef(null);
  const [lastKeyPress, setLastKeyPress] = useState(0);

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
    color: theme.text1,
  };

  const editContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    maxWidth: "100%",
  };

  const editInputStyle = {
    flex: 1,
    minWidth: 0,
    maxWidth: "300px",
    padding: "2px 6px",
    border: `1px solid ${theme.surface3}`,
    borderRadius: "4px",
    fontSize: "14px",
    backgroundColor: theme.surface1,
    color: theme.text1,
  };

  const iconButtonStyle = {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "2px",
    color: theme.text2,
    borderRadius: "4px",
    flexShrink: 0,
  };

  const saveTitle = useCallback(() => {
    if (title.trim() !== "" && title !== currentDialogConfig.title) {
      dispatch(
        patchData({
          id: currentDialogConfig.id,
          changes: { title },
          source: currentDialogConfig.source,
        }),
      );
    }
    setEditing(false);
  }, [dispatch, title, currentDialogConfig]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setTitle(currentDialogConfig.title || t("newDialog"));
  }, [currentDialogConfig.title, t]);

  const handleKeyDown = useCallback(
    (e) => {
      const now = Date.now();
      if (e.key === "Enter" && now - lastKeyPress > 100) {
        e.preventDefault();
        saveTitle();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelEdit();
      }
      setLastKeyPress(now);
    },
    [saveTitle, cancelEdit, lastKeyPress],
  );

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      if (document.activeElement !== editInputRef.current) {
        saveTitle();
      }
    }, 100);
  }, [saveTitle]);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div style={titleContainerStyle}>
      {!isEditing ? (
        <>
          <h1 style={dialogTitleStyle}>{title}</h1>
          {allowEdit && (
            <button
              onClick={() => setEditing(true)}
              aria-label="Edit title"
              style={iconButtonStyle}
            >
              <PencilIcon size={12} />
            </button>
          )}
        </>
      ) : (
        <div style={editContainerStyle}>
          <input
            ref={editInputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            style={editInputStyle}
          />
          <button
            onClick={saveTitle}
            aria-label="Save title"
            style={iconButtonStyle}
          >
            <CheckIcon size={12} />
          </button>
          <button
            onClick={cancelEdit}
            aria-label="Cancel editing"
            style={iconButtonStyle}
          >
            <XIcon size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(EditableTitle);
