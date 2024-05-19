import IconButton from "ui/IconButton";
import { TrashIcon } from "@primer/octicons-react";
import * as stylex from "@stylexjs/stylex";
import { useDispatch } from "react-redux";
import { addMessage, deleteMessage, deleteNotFound } from "./messageSlice";
import { useAppSelector } from "app/hooks";
import { useEffect, useState } from "react";
import { read, selectById } from "database/dbSlice";
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
  const message = useAppSelector((state) => selectById(state, id));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const getMessage = async () => {
      dispatch(read(id))
        .then((action) => {
          dispatch(addMessage(action.payload));
          setError(null); // 清除错误信息
        })
        .catch((err) => {
          setError(err); // 捕捉错误
        })
        .finally(() => {
          setLoading(false); // 结束加载
        });
    };
    getMessage();
  }, []);
  const couldDelete = true;
  const handleDeleteMessage = () => {
    dispatch(deleteMessage(id));
  };
  if (loading) {
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
