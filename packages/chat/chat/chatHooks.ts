import { useSelector } from "react-redux";
import { RootState } from "app/store";
import { selectChatById, selectChat } from "../chatSlice";

export const useCurrentChatConfig = () => {
  const currentChatId = useSelector(
    (state: RootState) => selectChat(state).currentChatId,
  );
  const currentChatConfig = useSelector((state: RootState) =>
    currentChatId ? selectChatById(state, currentChatId) : null,
  );

  return currentChatConfig;
};
