import { NavLink } from "react-router-dom";
import { useGetEntryQuery } from "database/services";
import { useModal, Dialog, Alert, useDeleteAlert } from "ui";
import { PencilIcon, TrashIcon } from "@primer/octicons-react";
import ChatConfigForm from "ai/blocks/ChatConfigForm";
import { useDeleteEntryMutation } from "database/services";
import { useAppDispatch } from "app/hooks";
import { removeOne } from "database/dbSlice";
import { useNavigate } from "react-router-dom";

export const DialogItem = ({ dialog, isSelected, allowEdit }) => {
  const { visible: editVisible, open: openEdit, close: closeEdit } = useModal();
  const [deleteEntry] = useDeleteEntryMutation();

  const { data, isLoading } = useGetEntryQuery({ entryId: dialog.llmId });
  console.log("dialogitem data", data);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onDeleteDialog = async (dialog) => {
    await deleteEntry({ entryId: dialog.id }).unwrap();
    await deleteEntry({ entryId: dialog.messageListId }).unwrap();
    dispatch(removeOne(dialog.id));
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
        to={`/chat?chatId=${dialog.id}`}
        className="flex-grow text-gray-600 hover:text-gray-800"
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
              confirmDelete(data);
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
              message={`你确定要删除 ${data?.name} 的对话吗？`}
            />
          )}
        </div>
      )}
    </div>
  );
};
