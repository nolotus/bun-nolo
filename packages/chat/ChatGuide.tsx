import CreateChatAIButton from "ai/blocks/CreateChatAIButton";
import ChatAIList from "ai/blocks/ChatAIList";
import { nolotusId } from "core/init";
import { chatAIOptions } from "ai/request";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { query } from "database/dbSlice";
import { selectFilteredDataByUserAndType } from "database/selectors";
import { DataType } from "create/types";

export const ChatGuide = () => {
  const dispath = useAppDispatch();
  const data = useAppSelector(
    selectFilteredDataByUserAndType(nolotusId, DataType.ChatRobot),
  );
  useEffect(() => {
    const queryConfig = { queryUserId: nolotusId, options: chatAIOptions };
    dispath(query(queryConfig));
  }, []);
  return (
    <div className="container mx-auto mt-16">
      <h2>创建自己的=》</h2>
      <CreateChatAIButton />
      <h2>使用别人的=》</h2>
      {data && <ChatAIList data={data} />}
    </div>
  );
};
