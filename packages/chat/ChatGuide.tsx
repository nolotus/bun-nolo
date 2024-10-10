import CreateCybotButton from "ai/cybot/CreateCybotButton";
import { nolotusId } from "core/init";
import Cybots from "ai/cybot/Cybots";

const ChatGuide = () => {
  return (
    <div style={{ padding: "20px", marginTop: "4rem" }}>
      <h3 style={{ marginBottom: "1rem" }}>创建自己的</h3>
      <p>
        这里添加具体的引导。 1如何使用已经建立好的 2如何自己新建一个
        3如何使用别人的
      </p>
      <CreateCybotButton />
      <h3 style={{ marginTop: "2rem", marginBottom: "1rem" }}>使用别人的</h3>
      <Cybots queryUserId={nolotusId} limit={15} />
    </div>
  );
};

export default ChatGuide;
