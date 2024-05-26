import { NavLink } from "react-router-dom";
import { useModal, Dialog, Alert, useDeleteAlert } from "ui";
import { PencilIcon, PlusIcon, TrashIcon } from "@primer/octicons-react";
import ChatConfigForm from "ai/blocks/ChatConfigForm";
import { useAppDispatch, useAppSelector, useFetchData } from "app/hooks";
import { useNavigate } from "react-router-dom";
import { createDialog, deleteDialog, initDialog } from "./dialogSlice";
import IconButton from "ui/IconButton";
import Sizes from "open-props/src/sizes";
import Colors from "open-props/src/colors";
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
  const brandColor = useAppSelector((state) => state.theme.brandColor);

  return (
    <div
      className={`group flex cursor-pointer items-center px-4 py-2 transition duration-150 ease-in-out`}
    >
      <NavLink
        to={`/chat?dialogId=${dialog.id}`}
        onClick={() => dispatch(initDialog(dialog.id))}
      >
        <button className={` ${isSelected ? "surface3  " : "surface1"} `}>
          <span>{data?.name}</span>
        </button>
      </NavLink>

      {allowEdit && (
        <div className="ml-auto flex space-x-2 opacity-0 transition duration-150 ease-in-out group-hover:opacity-100">
          <IconButton
            icon={PlusIcon}
            style={{ color: Colors["--stone-12"] }}
            onClick={() => {
              dispatch(createDialog(dialog.llmId));
            }}
          />

          <IconButton
            icon={PencilIcon}
            style={{ color: Colors["--blue-5"] }}
            onClick={(e) => {
              e.stopPropagation();
              openEdit();
            }}
          />
          {editVisible && (
            <Dialog
              isOpen={editVisible}
              onClose={closeEdit}
              title={`Edit ${data.name}`}
            >
              <ChatConfigForm initialValues={data} onClose={closeEdit} />
            </Dialog>
          )}

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
              title={`删除和${data?.name}的对话？`}
              message={`你确定要删除 ${dialog?.id} 的对话吗？`}
            />
          )}
        </div>
      )}
    </div>
  );
};
