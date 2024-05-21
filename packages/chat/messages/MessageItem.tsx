import IconButton from "ui/IconButton";
import { TrashIcon } from "@primer/octicons-react";
import * as stylex from "@stylexjs/stylex";
import { useDispatch } from "react-redux";
import { addMessage, deleteMessage, deleteNotFound } from "./messageSlice";
import { useFetchData } from "app/hooks";
const styles = stylex.create({
  main: {
    display: "flex",
  },
  buttons: {
    marginLeft: "10px",
  },
});

export const MessageItem = ({ id }) => {
  const dispatch = useDispatch();
  const { data, loading, error } = useFetchData(id);

  const couldDelete = true;
  const handleDeleteMessage = () => {
    dispatch(deleteMessage(id));
  };
  if (loading) {
    return <div>loading</div>;
  } else if (data) {
    dispatch(addMessage(data));
    const { content } = data;
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
