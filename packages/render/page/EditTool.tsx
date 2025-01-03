import React, { useCallback } from "react";
import { useAppDispatch } from "app/hooks";
import { deleteData } from "database/dbSlice";


// web imports
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import {
  CheckIcon,
  EyeIcon,
  TrashIcon,
  CommentDiscussionIcon,
} from "@primer/octicons-react";
import Button from "web/ui/Button";

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    padding: "4px",
    gap: "8px",
  }

} as const;

interface EditToolProps {
  handleSave: () => void;
  showChat: boolean;
  setShowChat: (show: boolean) => void;
}

export const EditTool: React.FC<EditToolProps> = ({
  handleSave,
  showChat,
  setShowChat,
}) => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isDeleting, setDeleting] = React.useState(false);


  const handleDelete = useCallback(async () => {
    if (!pageId) return;

    setDeleting(true);
    try {
      await dispatch(deleteData({ id: pageId })).unwrap();
      toast.success("删除成功");
      navigate(-1);
    } catch (error) {
      toast.error("删除失败");
      console.error("Delete error:", error);
    } finally {
      setDeleting(false);
    }
  }, [pageId, dispatch, navigate]);

  const handleChatToggle = useCallback(() => {
    setShowChat(!showChat);
  }, [showChat, setShowChat]);

  if (!pageId) return null;

  return (
    <div style={styles.container}>
      {/* 保存按钮 */}
      <Button
        variant="primary"
        icon={<CheckIcon size={16} />}
        onClick={handleSave}
        size="medium"
      >
        保存
      </Button>

      {/* 预览按钮 */}
      <Button
        variant="secondary"
        icon={<EyeIcon size={16} />}
        onClick={() => navigate(`/${pageId}`)}
        size="medium"
      >
        预览
      </Button>

      {/* 删除按钮 */}
      <Button
        variant="secondary"
        status="error"
        icon={<TrashIcon size={16} />}
        onClick={handleDelete}
        loading={isDeleting}
        disabled={isDeleting}
        size="medium"
      >
        {isDeleting ? "删除中..." : "删除"}
      </Button>

      {/* 对话按钮 */}
      <Button
        variant="secondary"
        icon={<CommentDiscussionIcon size={16} />}
        onClick={handleChatToggle}
        size="medium"
      >
        {showChat ? "关闭对话" : "打开对话"}
      </Button>
    </div>
  );
};
