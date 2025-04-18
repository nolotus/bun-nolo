import { useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import RobotMessage from "./RobotMessage";
import { SelfMessage } from "./SelfMessage";
import { UserMessage } from "./UserMessage";

interface MessageProps {
  message: {
    id: string;
    content?: string;
    controller?: any;
    userId?: string;
    cybotId?: string;
  };
}

export const MessageItem = ({ message }: MessageProps) => {
  const currentUserId = useAppSelector(selectCurrentUserId);
  const { id, content, controller, userId, cybotId } = message;
  console.log("cybotId", cybotId);
  if (!content) return null;

  if (currentUserId === userId && !cybotId) {
    return <SelfMessage content={content} id={id} />;
  }

  if (cybotId) {
    return <RobotMessage id={id} content={content} controller={controller} />;
  }

  return <UserMessage content={content} id={id} />;
};
