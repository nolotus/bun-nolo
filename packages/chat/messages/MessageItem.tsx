import IconButton from "ui/IconButton";
import { TrashIcon } from "@primer/octicons-react";
import * as stylex from "@stylexjs/stylex";
import { useDispatch } from "react-redux";
import { useAppSelector, useFetchData } from "app/hooks";
import { Avatar } from "ui";

import { deleteMessage, deleteNotFound } from "./messageSlice";
import { globalTokens as $, spacing } from "app/globalTokens.stylex";
import { selectCurrentUserId } from "auth/authSlice";
import RobotMessage from "./RobotMessage";

const fgColor = `rgba(${$.foregroundR}, ${$.foregroundG}, ${$.foregroundB}, 1)`;
const DARK = "@media (prefers-color-scheme: dark)";
const styles = stylex.create({
  main: {
    display: "flex",
  },
  avatar: {
    marginRight: spacing.xxxs,
  },
  buttons: {
    marginLeft: spacing.sm,
  },
});

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
    console.log("currentUserId", currentUserId);
    console.log("data.userId", data.userId);

    const isSelf = currentUserId === data.userId;
    const { content, image } = data;
    if (data.llmId) {
      return <RobotMessage id={id} content={content} image={image} />;
    }

    return (
      <div {...stylex.props(styles.main)}>
        <div {...stylex.props(styles.avatar)}></div>
        {content}
        <div {...stylex.props(styles.buttons)}>
          {couldDelete && (
            <IconButton icon={TrashIcon} onClick={handleDeleteMessage} />
          )}
        </div>
      </div>
    );
  } else if (error) {
    console.log("error", error);
    return (
      <div {...stylex.props(styles.main)}>
        {error.data.error}
        <div {...stylex.props(styles.buttons)}>
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
