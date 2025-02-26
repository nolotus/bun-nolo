// create/space/CreateSpaceButton.tsx
import { GoPlus } from "react-icons/go";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";

interface CreateSpaceButtonProps {
  onClick: () => void;
  getItemProps: any;
  listRef: (node: HTMLElement | null) => void;
  index: number;
}

export const CreateSpaceButton = ({
  onClick,
  getItemProps,
  listRef,
  index,
}: CreateSpaceButtonProps) => {
  const theme = useTheme();
  const { t } = useTranslation("space"); // 指定 space 命名空间

  return (
    <div
      ref={(node) => listRef(node)}
      {...getItemProps({
        onClick,
      })}
      className="space-create-button"
      role="button"
      aria-label={t("create")} // 使用扁平键 "create"
    >
      <div className="space-create-button__content">
        <GoPlus size={12} />
        <span>{t("create")}</span> {/* 使用扁平键 "create" */}
      </div>

      <style jsx>{`
        .space-create-button {
          position: relative;
          margin-top: ${index > 0 ? "4px" : "0"};
          border-top: ${index > 0 ? `1px solid ${theme.border}` : "none"};
          padding: 4px;
        }

        .space-create-button__content {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 8px;
          border-radius: 4px;
          transition: all 0.2s ease;
          color: ${theme.primary};
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          user-select: none;
        }

        .space-create-button:active .space-create-button__content {
          transform: scale(0.98);
        }

        .space-create-button:hover .space-create-button__content {
          background: ${`${theme.primary}12`};
        }

        .space-create-button:focus-visible {
          outline: none;
        }

        .space-create-button:focus-visible .space-create-button__content {
          outline: 2px solid ${theme.primary};
          outline-offset: -1px;
        }
      `}</style>
    </div>
  );
};
