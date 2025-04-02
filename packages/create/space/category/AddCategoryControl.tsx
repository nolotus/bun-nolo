import React, { memo, useState, useCallback } from "react";
import { useAppDispatch } from "app/hooks";
import { addCategory } from "create/space/spaceSlice";
import Button from "web/ui/Button";
import { useTheme } from "app/theme";

import { AddCategoryModal } from "./AddCategoryModal";

const AddCategoryControl: React.FC = memo(() => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const handleAddCategory = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  const handleAddCategoryConfirm = useCallback(
    (name: string) => {
      if (name.trim()) {
        dispatch(addCategory({ name }));
        setIsAddModalOpen(false);
      }
    },
    [dispatch]
  );

  return (
    <>
      {/* Renamed class */}
      <div className="AddCategoryControl__container">
        <Button
          block
          variant="secondary"
          size="medium"
          onClick={handleAddCategory}
          // Renamed class
          className="AddCategoryControl__button"
        >
          添加分类
        </Button>
      </div>

      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onAddCategory={handleAddCategoryConfirm}
      />

      {/* Updated style selectors */}
      <style>{`
        .AddCategoryControl__container {
          padding: 4px 12px 4px;
          margin-top: 4px;
        }

        .AddCategoryControl__button {
          transition: all 0.2s ease;
          background: ${theme.backgroundSecondary};
          border: none;
          border-radius: 8px;
          color: ${theme.textSecondary};
          font-weight: 500;
          height: 36px;
        }

        .AddCategoryControl__button:hover {
          background: ${theme.primaryGhost || "rgba(22, 119, 255, 0.06)"};
          color: ${theme.primary};
          transform: translateY(-1px);
        }

        .AddCategoryControl__button:active {
          transform: translateY(0);
        }
      `}</style>
    </>
  );
});

export default AddCategoryControl;
