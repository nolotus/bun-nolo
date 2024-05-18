import { useGetEntryQuery } from "database/services";
import IconButton from "ui/IconButton";
import { TrashIcon } from "@primer/octicons-react";
import * as stylex from "@stylexjs/stylex";
import { useDispatch } from "react-redux";
import { deleteMessage, deleteNotFound } from "./messageSlice";
import { useItem } from "app/hooks";
const styles = stylex.create({
  main: {
    display: "flex",
  },
  buttons: {
    marginLeft: "10px",
  },
});

export const MessageItem = ({ id }) => {
  const localMessage = useItem(id);

  const {
    data: serverMessage,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetEntryQuery({ entryId: id });
  const message = localMessage ? localMessage : serverMessage;
  const couldDelete = true;
  const dispatch = useDispatch();
  const handleDeleteMessage = () => {
    dispatch(deleteMessage(id));
  };
  if (isLoading) {
    return <div>loading</div>;
  } else if (message) {
    const { content } = message;
    return (
      <div {...stylex.props(styles.main)}>
        {content}
        <div {...stylex.props(styles.buttons)}>
          {couldDelete && (
            <IconButton icon={TrashIcon} onClick={handleDeleteMessage} />
          )}
        </div>
      </div>
    );
  } else if (isError) {
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
