import CreateCybotButton from "ai/cybot/CreateCybotButton";
import { nolotusId } from "core/init";
import Cybots from "ai/cybot/Cybots";
import withTranslations from "i18n/withTranslations";
import { useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";

const ChatGuide = () => {
  const userId = useAppSelector(selectCurrentUserId);

  return (
    <div
      className="guide-container"
      style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}
    >
      {/* 创建新的部分 */}
      <section className="create-section" style={{ marginBottom: "3rem" }}>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>创建新的</h3>
        <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
          <p style={{ flex: 1 }}>
            这里添加具体的引导。
            <br />
            1. 如何使用已经建立好的
            <br />
            2. 如何自己新建一个
            <br />
            3. 如何使用别人的
          </p>
          <CreateCybotButton />
        </div>
      </section>

      {/* 自己的机器人列表 */}
      <section style={{ marginBottom: "3rem" }}>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>
          自己新建的
        </h3>
        {userId && <Cybots queryUserId={userId} limit={48} />}
      </section>

      {/* 他人的机器人列表 */}
      <section>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>
          使用别人的
        </h3>
        <Cybots queryUserId={nolotusId} limit={12} />
      </section>
    </div>
  );
};

export default withTranslations(ChatGuide, ["chat", "ai"]);
