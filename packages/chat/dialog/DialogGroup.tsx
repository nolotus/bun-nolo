// DialogGroup.js
import React from "react";
import { useAppDispatch, useFetchData } from "app/hooks";
import IconButton from "render/ui/IconButton";
import { PlusIcon } from "@primer/octicons-react";
import OpenProps from "open-props";

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

  return (
    <div key={llmId}>
      <div style={{ display: "flex", gap: OpenProps.sizeFluid1 }}>
        <div>{llm?.name}</div>
        <IconButton
          icon={PlusIcon}
          style={{ color: "var('--text-1')" }}
          onClick={() => {
            dispatch(createDialog(llmId));
          }}
        />
      </div>
      {dialogs.map((dialog) => (
        <DialogItem
          key={dialog.id}
          id={dialog.id}
          isSelected={currentDialogId === dialog.id}
          allowEdit={isCreator(dialog.id)}
          source={source}
        />
      ))}
    </div>
  );
};
