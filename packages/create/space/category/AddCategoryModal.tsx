import { useState } from "react";
import { BaseActionModal } from "web/ui/BaseActionModal";
import Button from "render/web/ui/Button";
import { useTheme } from "app/theme";
import { XIcon } from "@primer/octicons-react";
import { Input } from "render/web/form/Input";
interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (name: string) => void;
}

export const AddCategoryModal = ({
  isOpen,
  onClose,
  onAddCategory,
}: AddCategoryModalProps) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const theme = useTheme();

  const handleConfirmAdd = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName("");
    }
  };

  return (
    <BaseActionModal
      isOpen={isOpen}
      onClose={onClose}
      title="添加新分类"
      status="info"
      headerExtra={
        <button
          style={{
            background: "none",
            border: "none",
            color: theme.textSecondary,
            cursor: "pointer",
            padding: "0",
            display: "flex",
            alignItems: "center",
          }}
          onClick={onClose}
        >
          <XIcon size={16} />
        </button>
      }
      actions={
        <>
          <Button variant="secondary" size="small" onClick={onClose}>
            取消
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={handleConfirmAdd}
            disabled={!newCategoryName.trim()}
          >
            添加
          </Button>
        </>
      }
      width={400}
    >
      <Input
        type="text"
        value={newCategoryName}
        onChange={(e) => setNewCategoryName(e.target.value)}
        placeholder="请输入分类名称"
        onKeyDown={(e) => {
          if (e.key === "Enter") handleConfirmAdd();
        }}
      />
    </BaseActionModal>
  );
};
