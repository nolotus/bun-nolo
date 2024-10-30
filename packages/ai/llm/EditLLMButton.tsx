import React, { useState } from "react";
import { useFetchData } from "app/hooks";

import { Dialog } from "render/ui/Dialog";
import { useModal } from "render/ui/Modal";
import EditLLM from "ai/llm/EditLLM";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";

const LLMNameButton = React.memo(({ llmId }) => {
  const { isLoading, data: llm } = useFetchData(llmId);
  console.log("llm", llm);
  const { visible: editVisible, open: openEdit, close: closeEdit } = useModal();
  const theme = useSelector(selectTheme);
  const [isHovered, setIsHovered] = useState(false);

  if (isLoading) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    openEdit();
  };

  const buttonStyles = {
    fontSize: theme.fontSize.small,
    padding: `${theme.spacing.xsmall} ${theme.spacing.small}`,
    borderRadius: "8px",
    backgroundColor: isHovered ? theme.surface3 : theme.surface2,
    color: theme.text2,
    cursor: "pointer",
    transition: "background-color 0.2s",
  };

  return (
    <>
      <button
        onClick={handleClick}
        style={buttonStyles}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        edit
      </button>
      {editVisible && llm && (
        <Dialog
          isOpen={editVisible}
          onClose={closeEdit}
          title={`Edit ${llm.name || "LLM"}`}
        >
          <EditLLM initialValues={llm} onClose={closeEdit} />
        </Dialog>
      )}
    </>
  );
});

export default LLMNameButton;
