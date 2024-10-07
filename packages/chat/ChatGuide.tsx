import CreateCybotButton from "ai/cybot/CreateCybotButton";
import { nolotusId } from "core/init";
import Cybots from "ai/cybot/Cybots";

const ChatGuide = () => {
  return (
    <div className="container mt-16">
      <h3>创建自己的</h3>
      这里添加具体的引导。 1如何使用已经建立好的 2如何自己新建一个
      3如何使用别人的
      <CreateCybotButton />
      <h3>使用别人的</h3>
      <Cybots queryUserId={nolotusId} limit={15} />
    </div>
  );
};
export default ChatGuide;
