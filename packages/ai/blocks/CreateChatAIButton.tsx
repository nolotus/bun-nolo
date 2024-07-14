import { useModal, Dialog } from "render/ui";
import { useTranslation } from "react-i18next";
import CreateCybot from "../cybot/CreateCybot";

const CreateChatAIButton = () => {
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
        title={<h2 className="text-xl font-bold">{t("createRobot")}</h2>}
      >
        <CreateCybot onClose={closeConfigModal} />
      </Dialog>
      <button type="button" onClick={openConfigModal} className="text-blue-400">
        创建对话AI
      </button>
    </>
  );
};
export default CreateChatAIButton;
