import { useFetchData } from "app/hooks";
import { useCouldEdit } from "auth/hooks/useCouldEdit";
import React from "react";
import { Dialog } from "render/ui/Dialog";
import { useModal } from "render/ui/Modal";
import { useTheme } from "app/theme";
import QuickEditCybot from "./QuickEditCybot";

const CybotNameChip = React.memo(({ cybotId }) => {
  const theme = useTheme();
  const { isLoading, data: cybot } = useFetchData(cybotId);
  const { visible: editVisible, open: openEdit, close: closeEdit } = useModal();
  const allowEdit = useCouldEdit(cybotId);

  if (isLoading) return null;

  const displayName = cybot?.name;

  const handleClick = (e) => {
    e.stopPropagation();
    openEdit();
  };

  return (
    <>
      <style>
        {`
          .cybot-chip {
            font-size: 13px;
            padding: 4px 12px;
            border-radius: 12px;
            background-color: ${theme.backgroundSecondary};
            color: ${theme.textSecondary};
            max-width: 100px;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            border: 1px solid ${theme.border};
          }

          .cybot-chip:hover {
            background-color: ${theme.backgroundGhost};
            border-color: ${theme.borderHover};
            color: ${theme.text};
          }
        `}
      </style>

      <span className="cybot-chip" title={displayName} onClick={handleClick}>
        {displayName}
      </span>

      {allowEdit && editVisible && cybot && (
        <Dialog
          isOpen={editVisible}
          onClose={closeEdit}
          title={`Edit ${cybot.name || "Cybot"}`}
        >
          <QuickEditCybot initialValues={cybot} onClose={closeEdit} />
        </Dialog>
      )}
    </>
  );
});

export default CybotNameChip;
