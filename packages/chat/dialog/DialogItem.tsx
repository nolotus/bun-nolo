import { NavLink } from "react-router-dom";
import { Alert, useDeleteAlert } from "render/ui";
import {
  CheckIcon,
  PencilIcon,
  TrashIcon,
  XIcon,
} from "@primer/octicons-react";
import { useAppDispatch, useFetchData } from "app/hooks";
import { useNavigate } from "react-router-dom";
import { useCouldEdit } from "auth/useCouldEdit";
import { useEffect, useState } from "react";
import OpenProps from "open-props";

import { deleteDialog, initDialog } from "./dialogSlice";
import { patchData } from "database/dbSlice";

export const DialogItem = ({ id, isSelected, source }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: dialog } = useFetchData(id, { source });
  const { data: llm } = useFetchData(dialog.llmId, { source });

  const [isEditing, setEditing] = useState(false);
  const [title, setTitle] = useState(id);

  const onDeleteDialog = async (dialog) => {
    dispatch(deleteDialog(dialog)).then((result) => {
      console.log("result", result);
    });
    navigate("/chat");
  };
  const {
    visible: deleteAlertVisible,
    confirmDelete,
    doDelete,
    closeAlert,
    modalState,
  } = useDeleteAlert(() => {
    onDeleteDialog(dialog);
  });
  const allowEdit = useCouldEdit(id);

  useEffect(() => {
    setTitle(dialog?.title || dialog.id);
  }, [dialog, llm]);

  const saveTitle = async () => {
    dispatch(patchData({ id, changes: { title }, source: dialog.source }));
    setEditing(false);
  };
  const cancleEdit = () => {
    setEditing(false);
  };
  return (
    <div
      className={`group flex cursor-pointer items-center transition duration-150 ease-in-out`}
    >
      {!isEditing && (
        <NavLink
          to={`/chat?dialogId=${dialog.id}`}
          onClick={() =>
            dispatch(initDialog({ dialogId: dialog.id, source: dialog.source }))
          }
          className={`${isSelected && " surface2"} px-4 py-1`}
          style={{ maxWidth: OpenProps.size12 }}
        >
          <span>{title}</span>
        </NavLink>
      )}

      {isEditing && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <input
            placeholder={title}
            style={{ width: "70%" }}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          ></input>
          <div style={{ display: "flex", gap: OpenProps.size2 }}>
            <button onClick={saveTitle} style={{ padding: "1px" }}>
              <CheckIcon />
            </button>
            <button onClick={cancleEdit} style={{ padding: "1px" }}>
              <XIcon />
            </button>
          </div>
        </div>
      )}
      {allowEdit && !isEditing && (
        <div className="flex space-x-2 opacity-0 transition duration-150 ease-in-out group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
            style={{ padding: OpenProps.size1 }}
          >
            <PencilIcon />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              confirmDelete(dialog);
            }}
            style={{ padding: OpenProps.size1 }}
          >
            <TrashIcon />
          </button>

          {deleteAlertVisible && (
            <Alert
              isOpen={deleteAlertVisible}
              onClose={closeAlert}
              onConfirm={doDelete}
              title={`删除和${llm?.name}的对话？`}
              message={`你确定要删除对话吗？`}
            />
          )}
        </div>
      )}
    </div>
  );
};
