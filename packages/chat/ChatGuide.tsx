import CreateCybotButton from "ai/cybot/CreateCybotButton";
import { nolotusId } from "core/init";
import Cybots from "ai/cybot/Cybots";
import withTranslations from "i18n/withTranslations";
import { useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";

const ChatGuide = () => {
  const userId = useAppSelector(selectCurrentUserId);

  return (
    <div>
      <h3 style={{ marginBottom: "1rem" }}>创建新的</h3>
      <p>
        这里添加具体的引导。 1如何使用已经建立好的 2如何自己新建一个
        3如何使用别人的
      </p>
      <CreateCybotButton />

      <h3 style={{ marginTop: "1rem", marginBottom: "1rem" }}>自己新建的</h3>
      {userId && <Cybots queryUserId={userId} limit={48} />}

      <h3 style={{ marginTop: "1rem", marginBottom: "1rem" }}>使用别人的</h3>

      <Cybots queryUserId={nolotusId} limit={12} />
    </div>
  );
};

export default withTranslations(ChatGuide, ["chat", "ai"]);
