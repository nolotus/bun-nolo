import { useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import RobotMessage from "./RobotMessage";
import { SelfMessage } from "./SelfMessage";
import { UserMessage } from "./UserMessage";

export const MessageItem = ({ message }) => {
  const currentUserId = useAppSelector(selectCurrentUserId);
  const { id, content, controller, userId, cybotId, dbKey } = message;
  if (!content) return null;

  if (currentUserId === userId && !cybotId) {
    return <SelfMessage content={content} dbKey={dbKey} />;
  }

  if (cybotId) {
    return (
      <RobotMessage
        dbKey={dbKey}
        content={content}
        controller={controller}
        cybotId={cybotId}
      />
    );
  }

  return <UserMessage content={content} id={id} />;
};
