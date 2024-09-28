import { useModal, Dialog } from "render/ui";
import { useTranslation } from "react-i18next";
import CreateCybot from "../cybot/CreateCybot";

const CreateCybotButton = () => {
  const { t } = useTranslation();

  const {
    visible: configModalVisible,
    open: openConfigModal,
    close: closeConfigModal,
  } = useModal();

  return (
    <>
      <Dialog
        isOpen={configModalVisible}
        onClose={closeConfigModal}
        title={
          <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
            {t("createRobot")}
          </h2>
        }
      >
        <CreateCybot onClose={closeConfigModal} />
      </Dialog>
      <button
        type="button"
        onClick={openConfigModal}
        style={{ color: "#60a5fa" }}
      >
        创建对话AI
      </button>
    </>
  );
};
export default CreateCybotButton;
