import { NavLink } from "react-router-dom";
import { useModal, Dialog, Alert, useDeleteAlert } from "ui";
import { PencilIcon, TrashIcon } from "@primer/octicons-react";
import ChatConfigForm from "ai/blocks/ChatConfigForm";
import { useAppDispatch, useFetchData } from "app/hooks";
import { useNavigate } from "react-router-dom";
import { deleteDialog, initDialog } from "./dialogSlice";

export const DialogItem = ({ dialog, isSelected, allowEdit }) => {
  const { visible: editVisible, open: openEdit, close: closeEdit } = useModal();
  const { data } = useFetchData(dialog.llmId);
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
  return (
    <div
      className={`group flex cursor-pointer items-center px-4 py-2 ${
        isSelected ? "bg-gray-200" : "hover:bg-gray-100"
      } transition duration-150 ease-in-out`}
    >
      <NavLink
        to={`/chat?dialogId=${dialog.id}`}
        className="flex-grow text-gray-600 hover:text-gray-800"
        onClick={() => dispatch(initDialog(dialog.id))}
      >
        <span className="block p-2">{data?.name}</span>
      </NavLink>
      {allowEdit && (
        <div className="ml-auto flex space-x-2 opacity-0 transition duration-150 ease-in-out group-hover:opacity-100">
          <button
            type="button"
            className="text-gray-500 hover:text-blue-500 focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              openEdit();
            }}
          >
            <PencilIcon size={16} />
          </button>
          {editVisible && (
            <Dialog
              isOpen={editVisible}
              onClose={closeEdit}
              title={`Edit ${data.name}`}
            >
              <ChatConfigForm initialValues={data} onClose={closeEdit} />
            </Dialog>
          )}
          <button
            type="button"
            className="text-gray-500 hover:text-red-500 focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              confirmDelete(dialog);
            }}
          >
            <TrashIcon size={16} />
          </button>
          {deleteAlertVisible && (
            <Alert
              isOpen={deleteAlertVisible}
              onClose={closeAlert}
              onConfirm={doDelete}
              title={`删除和${data?.name}的对话？`}
              message={`你确定要删除 ${dialog?.id} 的对话吗？`}
            />
          )}
        </div>
      )}
    </div>
  );
};
