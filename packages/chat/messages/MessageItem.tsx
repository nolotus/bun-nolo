import { useGetEntryQuery, useLazyGetEntryQuery } from "database/services";
import IconButton from "ui/IconButton";
import { TrashIcon } from "@primer/octicons-react";
import * as stylex from "@stylexjs/stylex";
import { useDispatch } from "react-redux";
import { addMessage, deleteMessage, deleteNotFound } from "./messageSlice";
import { useItem } from "app/hooks";
import { useEffect, useState } from "react";
import { upsertOne } from "database/dbSlice";
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

  const localMessage = useItem(id);

  const [trigger, { isError, error }] = useLazyGetEntryQuery();
  const [message, setMessage] = useState();
  // let message = localMessage ? localMessage : serverMessage;

  useEffect(() => {
    if (localMessage) {
      setMessage(localMessage);
    } else {
      //这里无论如何都会执行一次
      console.log("localMessage", localMessage);
      const getMessage = async () => {
        const result = await trigger({ entryId: id }).unwrap();
        console.log("trigger result", result);
        dispatch(upsertOne(result));
        dispatch(addMessage(result));
      };
      getMessage();
    }
  }, [localMessage]);
  const couldDelete = true;
  const handleDeleteMessage = () => {
    dispatch(deleteMessage(id));
  };
  if (!message) {
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
