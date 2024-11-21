import { PlusIcon } from "@primer/octicons-react";
import { useModal } from "render/ui/Modal";
import { Dialog } from "render/ui/Dialog";
import { useTranslation } from "react-i18next";
import { CreateWorkSpaceForm } from "./CreateWorkSpaceForm";
import { GoPlus } from "react-icons/go";

export const CreateWorkSpaceButton = () => {
  const { t } = useTranslation();

  const { visible, open, close } = useModal();

  return (
    <>
      <button onClick={open} style={{ background: "transparent" }}>
        <GoPlus size="18" />
      </button>
      <Dialog isOpen={visible} onClose={close}>
        <CreateWorkSpaceForm onClose={close} />
      </Dialog>
    </>
  );
};
