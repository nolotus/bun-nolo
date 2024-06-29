import React from "react";
import { useFetchData } from "app/hooks";
import IconButton from "render/ui/IconButton";
import { PlusIcon } from "@primer/octicons-react";
import OpenProps from "open-props";
import { PencilIcon } from "@primer/octicons-react";
import { useModal, Dialog } from "render/ui";
import ChatConfigForm from "ai/blocks/ChatConfigForm";
import { Spinner } from "@primer/react";
import { useCouldEdit } from "auth/useCouldEdit";
import { DialogItem } from "./DialogItem";
import { useCreateDialog } from "./useCreateDialog";
import { extractCustomId } from "core";

export const DialogGroup = ({ llmId, dialogs, currentDialogId, source }) => {
  const { isLoading, data: llm } = useFetchData(llmId, { source });
  const { visible: editVisible, open, close: closeEdit } = useModal();
  const { isLoading: creatingDialog, createDialog } = useCreateDialog();
  const allowEdit = useCouldEdit(llmId);
  if (isLoading) {
    return <Spinner />;
  }
  return (
    <div key={llmId}>
      <div style={{ display: "flex", gap: OpenProps.sizeFluid1 }}>
        <div>{llm?.name ? llm.name : extractCustomId(llmId)}</div>
        {allowEdit && (
          <>
            <IconButton
              icon={PlusIcon}
              isLoading={creatingDialog}
              onClick={() => {
                createDialog(llmId);
              }}
            />
            <IconButton
              icon={PencilIcon}
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
            />
            {editVisible && (
              <Dialog
                isOpen={editVisible}
                onClose={closeEdit}
                title={`Edit ${llm.name}`}
              >
                <ChatConfigForm initialValues={llm} onClose={closeEdit} />
              </Dialog>
            )}
          </>
        )}
      </div>
      {dialogs.map((dialog) => (
        <DialogItem
          key={dialog.id}
          id={dialog.id}
          isSelected={currentDialogId === dialog.id}
          source={source}
        />
      ))}
    </div>
  );
};
