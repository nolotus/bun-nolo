import IconButton from "render/ui/IconButton";
import { TrashIcon } from "@primer/octicons-react";
import { useDispatch } from "react-redux";
import { useAppSelector, useFetchData } from "app/hooks";

import { deleteMessage, deleteNotFound } from "./messageSlice";
import { selectCurrentUserId } from "auth/authSlice";
import RobotMessage from "./RobotMessage";
import { UserMessage } from "./UserMessage";
import { SelfMessage } from "./SelfMessage";

export const MessageItem = ({ id }) => {
  const dispatch = useDispatch();
  const { data, loading, error } = useFetchData(id);
  const currentUserId = useAppSelector(selectCurrentUserId);
  const couldDelete = true;
  const handleDeleteMessage = () => {
    dispatch(deleteMessage(id));
  };
  if (loading) {
    return <div>loading</div>;
  } else if (data) {
    const isSelf = currentUserId === data.userId;

    const { content, image } = data;
    if (isSelf) {
      return <SelfMessage content={content} id={id} />;
    } else if (data.llmId) {
      return <RobotMessage id={id} content={content} image={image} />;
    }
    return (
      <div className="flex">
        <UserMessage content={content} />
        <div>
          {couldDelete && (
            <IconButton icon={TrashIcon} onClick={handleDeleteMessage} />
          )}
        </div>
      </div>
    );
  } else if (error) {
    console.log("error", error);
    return (
      <div className="flex">
        {error.data.error}
        <div>
          {couldDelete && (
            <IconButton
              icon={TrashIcon}
              onClick={() => dispatch(deleteNotFound(id))}
            />
          )}
        </div>
      </div>
    );
  }
};
