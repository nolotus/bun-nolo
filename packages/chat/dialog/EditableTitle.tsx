import React, { useState, useRef, useCallback, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { PencilIcon, CheckIcon, XIcon } from "@primer/octicons-react";
import { useAppDispatch } from "app/hooks";
import { patchData } from "database/dbSlice";

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
`;

const DialogTitle = styled.h1`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${(props) => props.theme.text1};
`;

const EditContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
`;

const EditInput = styled.input`
  flex: 1;
  min-width: 0;
  max-width: 300px;
  padding: 2px 6px;
  border: 1px solid ${(props) => props.theme.surface3};
  border-radius: 4px;
  font-size: 14px;
  background-color: ${(props) => props.theme.surface1};
  color: ${(props) => props.theme.text1};
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px;
  color: ${(props) => props.theme.text2};
  border-radius: 4px;
  flex-shrink: 0;

  &:hover {
    background-color: ${(props) => props.theme.surface2};
  }
`;

interface EditableTitleProps {
  currentDialogConfig: {
    id: string;
    title?: string;
    source: string;
  };
  allowEdit: boolean;
}

const EditableTitle: React.FC<EditableTitleProps> = ({
  currentDialogConfig,
  allowEdit,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [isEditing, setEditing] = useState(false);
  const [title, setTitle] = useState(
    currentDialogConfig.title || t("newDialog"),
  );
  const editInputRef = useRef<HTMLInputElement>(null);
  const [lastKeyPress, setLastKeyPress] = useState<number>(0);

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
    (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    // 使用短暂的延迟来确保这不会与其他事件冲突
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
    <TitleContainer>
      {!isEditing ? (
        <>
          <DialogTitle>{title}</DialogTitle>
          {allowEdit && (
            <IconButton
              onClick={() => setEditing(true)}
              aria-label="Edit title"
            >
              <PencilIcon size={12} />
            </IconButton>
          )}
        </>
      ) : (
        <EditContainer>
          <EditInput
            ref={editInputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          />
          <IconButton onClick={saveTitle} aria-label="Save title">
            <CheckIcon size={12} />
          </IconButton>
          <IconButton onClick={cancelEdit} aria-label="Cancel editing">
            <XIcon size={12} />
          </IconButton>
        </EditContainer>
      )}
    </TitleContainer>
  );
};

export default React.memo(EditableTitle);
