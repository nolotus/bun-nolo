import { NavLink } from "react-router-dom";
import { Alert, useDeleteAlert } from "render/ui";
import { PencilIcon, TrashIcon } from "@primer/octicons-react";
import { useAppDispatch, useFetchData } from "app/hooks";
import { useNavigate } from "react-router-dom";
import { deleteDialog, initDialog } from "./dialogSlice";
import IconButton from "render/ui/IconButton";
import Colors from "open-props/src/colors";
import { format } from "date-fns";
import { useCouldEdit } from "auth/useCouldEdit";

export const DialogItem = ({ id, isSelected, source }) => {
  const { data: dialog } = useFetchData(id, source);
  const { data: llm } = useFetchData(dialog.llmId, source);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
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

  return (
    <div
      className={`group flex cursor-pointer items-center transition duration-150 ease-in-out`}
    >
      <NavLink
        to={`/chat?dialogId=${dialog.id}`}
        onClick={() =>
          dispatch(initDialog({ dialogId: dialog.id, source: dialog.source }))
        }
        className={`${isSelected && " surface2"} px-4 py-1`}
        style={{}}
      >
        <span>
          {dialog.title
            ? format(new Date(dialog.title), "MM-dd HH:mm")
            : llm?.name}
        </span>
      </NavLink>

      {allowEdit && (
        <div className="ml-auto flex space-x-2 opacity-0 transition duration-150 ease-in-out group-hover:opacity-100">
          <IconButton
            icon={PencilIcon}
            style={{ color: Colors["--blue-5"] }}
            onClick={(e) => {
              e.stopPropagation();
              // could edit dialog title
            }}
          />

          <IconButton
            icon={TrashIcon}
            style={{ color: Colors["--red-5"] }}
            onClick={(e) => {
              e.stopPropagation();
              confirmDelete(dialog);
            }}
          />
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
