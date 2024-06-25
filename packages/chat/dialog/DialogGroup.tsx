// DialogGroup.js
import React from "react";
import { useAppDispatch, useFetchData } from "app/hooks";
import IconButton from "render/ui/IconButton";
import { PlusIcon } from "@primer/octicons-react";
import OpenProps from "open-props";
import { PencilIcon } from "@primer/octicons-react";
import { useModal, Dialog } from "render/ui";
import ChatConfigForm from "ai/blocks/ChatConfigForm";

import { DialogItem } from "./DialogItem";
import { createDialog } from "./dialogSlice";

export const DialogGroup = ({
  llmId,
  dialogs,
  currentDialogId,
  isCreator,
  source,
}) => {
  const { data: llm } = useFetchData(llmId, source);
  const dispatch = useAppDispatch();
  const { visible: editVisible, open, close: closeEdit } = useModal();
  if (llm) {
    const allowEdit = isCreator(llm.id);

    return (
      <div key={llmId}>
        <div style={{ display: "flex", gap: OpenProps.sizeFluid1 }}>
          <div>{llm?.name}</div>
          {allowEdit && (
            <>
              <IconButton
                icon={PlusIcon}
                onClick={() => {
                  dispatch(createDialog(llmId));
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
            allowEdit={allowEdit}
            source={source}
          />
        ))}
      </div>
    );
  }
  return <div>loading</div>;
};
