import React, { useState } from "react";
import { useFetchData } from "app/hooks";
import { extractCustomId } from "core";
import { useModal, Dialog } from "render/ui";
import ChatConfigForm from "ai/blocks/ChatConfigForm";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";

const CybotNameChip = React.memo(({ cybotId, source }) => {
  const { isLoading, data: cybot } = useFetchData(cybotId, { source });
  const { visible: editVisible, open: openEdit, close: closeEdit } = useModal();
  const theme = useSelector(selectTheme);
  const [isHovered, setIsHovered] = useState(false);

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
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
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
      {editVisible && cybot && (
        <Dialog
          isOpen={editVisible}
          onClose={closeEdit}
          title={`Edit ${cybot.name || "Cybot"}`}
        >
          <ChatConfigForm initialValues={cybot} onClose={closeEdit} />
        </Dialog>
      )}
    </>
  );
});

export default CybotNameChip;
