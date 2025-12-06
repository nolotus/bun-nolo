import type React from "react";
import { LuEye, LuPencil } from "react-icons/lu";

interface ModeToggleProps {
  isEdit: boolean;
  onChange: (isEdit: boolean) => void;
  disabled?: boolean;
}

const ModeToggle: React.FC<ModeToggleProps> = ({
  isEdit,
  onChange,
  disabled = false,
}) => {
  return (
    <>
      <div
        className={`mode-toggle ${disabled ? "mode-toggle--disabled" : ""}`}
        role="group"
        aria-label="模式切换"
      >
        {/* 滑块背景轨道 */}
        <div
          className={`mode-toggle__slider ${isEdit ? "mode-toggle__slider--edit" : ""}`}
        />

        {/* 阅读模式按钮 */}
        <button
          className={`mode-toggle__button ${!isEdit ? "mode-toggle__button--active" : ""}`}
          onClick={() => onChange(false)}
          disabled={disabled}
          type="button"
          aria-label="阅读模式"
          title="阅读模式"
        >
          <LuEye className="mode-toggle__icon" />
        </button>

        {/* 编辑模式按钮 */}
        <button
          className={`mode-toggle__button ${isEdit ? "mode-toggle__button--active" : ""}`}
          onClick={() => onChange(true)}
          disabled={disabled}
          type="button"
          aria-label="编辑模式"
          title="编辑模式"
        >
          <LuPencil className="mode-toggle__icon" />
        </button>
      </div>

      <style href="ModeToggle" precedence="components">{`
        .mode-toggle {
          position: relative;
          display: inline-flex;
          align-items: center;
          /* 使用更深的背景作为凹槽 */
          background-color: var(--backgroundTertiary);
          /* 增加 Padding 以制造悬浮感 */
          padding: 3px;
          border-radius: 8px;
          border: 1px solid var(--border);
          width: fit-content;
          user-select: none;
        }

        .mode-toggle--disabled {
          opacity: 0.6;
          cursor: not-allowed;
          filter: grayscale(0.5);
        }

        .mode-toggle__slider {
          position: absolute;
          /* 宽度扣除左右 padding */
          width: calc(50% - 3px);
          top: 3px;
          bottom: 3px;
          left: 3px;
          /* 纯白卡片背景 */
          background-color: var(--background);
          border-radius: 6px;
          /* 拟物感核心：稍重的阴影制造厚度 */
          box-shadow: 0 1px 2px var(--shadowLight), 0 2px 4px var(--shadowMedium);
          transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
          z-index: 0;
        }

        .mode-toggle__slider--edit {
          transform: translateX(100%);
        }

        .mode-toggle__button {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          padding: 0;
          /* 紧凑的尺寸 */
          width: 28px;
          height: 26px;
          border-radius: 6px;
          cursor: pointer;
          /* 未选中状态使用更淡的灰色 */
          color: var(--textQuaternary);
          transition: color 0.2s ease;
        }

        .mode-toggle__button:hover:not(:disabled):not(.mode-toggle__button--active) {
          color: var(--textSecondary);
        }

        .mode-toggle__button--active {
          color: var(--primary);
        }
        
        .mode-toggle__icon {
          width: 14px;
          height: 14px;
          stroke-width: 2.5px;
        }
      `}</style>
    </>
  );
};

export default ModeToggle;
