// ai/cybot/CybotNameChip
import React, { useState } from "react";
import { useFetchData } from "app/hooks";
import { extractCustomId } from "core";
import { Dialog } from "render/ui/Dialog";
import { useModal } from "render/ui/Modal";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import { useCouldEdit } from "auth/useCouldEdit";

import QuickEditCybot from "./QuickEditCybot";
import { txt } from "render/styles/txt";

const CybotNameChip = React.memo(({ cybotId }) => {
  const { isLoading, data: cybot } = useFetchData(cybotId);
  const { visible: editVisible, open: openEdit, close: closeEdit } = useModal();
  const theme = useSelector(selectTheme);
  const [isHovered, setIsHovered] = useState(false);
  const allowEdit = useCouldEdit(cybotId);

  if (isLoading) return null;

  const displayName = cybot?.name || extractCustomId(cybotId);

  const handleClick = (e) => {
    e.stopPropagation();
    openEdit();
  };

  const chipStyles = {
    fontSize: theme.fontSize.small,
    padding: `${theme.spacing.xsmall} ${theme.spacing.small}`,
    borderRadius: "12px",
    backgroundColor: isHovered ? theme.surface3 : theme.surface2,
    color: theme.text2,
    ...txt.ellipsis,
    maxWidth: "100px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  };

  return (
    <>
      <span
        title={displayName}
        onClick={handleClick}
        style={chipStyles}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
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
