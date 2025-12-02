// render/web/ui/SearchInput.tsx
import React, { useRef } from "react";
import { LuX, LuSearch } from "react-icons/lu";
import Button from "./Button";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = "搜索...",
  className = "",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
    inputRef.current?.blur(); // 搜索后收起键盘/焦点
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={`search-form ${className}`}>
        <div className="search-container">
          <div className="input-field-wrapper">
            <LuSearch className="search-icon-left" size={18} />
            <input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="search-input-field"
            />

            {/* 清空按钮：有内容时显示，带动画 */}
            <div className={`clear-btn-wrapper ${value ? "visible" : ""}`}>
              <button
                type="button"
                onClick={() => {
                  onClear();
                  inputRef.current?.focus();
                }}
                className="clear-icon-button"
                title="清空搜索"
                tabIndex={value ? 0 : -1}
              >
                <LuX size={12} />
              </button>
            </div>
          </div>

          <div className="search-action">
            <Button
              type="submit"
              variant="primary"
              size="medium" // 调整为 medium 配合胶囊高度
              className="search-btn"
            >
              搜索
            </Button>
          </div>
        </div>
      </form>

      <style href="search-input" precedence="high">{`
        .search-form {
          width: 100%;
          min-width: 240px;
        }

        .search-container {
          display: flex;
          gap: 8px;
          width: 100%;
          align-items: center;
        }

        /* 输入框容器：拟物凹槽 + 胶囊外形 */
        .input-field-wrapper {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
          height: 40px; /* 默认高度 */
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 20px; /* 胶囊圆角 */
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          /* 40% 拟物：微弱内阴影营造凹陷感 */
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.03); 
        }

        /* 悬停与聚焦状态 */
        .input-field-wrapper:hover {
            border-color: var(--borderHover);
            background: var(--backgroundHover);
        }

        .input-field-wrapper:focus-within {
            background: var(--background);
            border-color: var(--primary);
            /* 柔和光晕，替代生硬的 outline */
            box-shadow: 0 0 0 3px var(--primary-alpha-10), inset 0 1px 1px rgba(0,0,0,0.02);
        }

        .search-icon-left {
          position: absolute;
          left: 12px;
          color: var(--textTertiary);
          pointer-events: none;
          transition: color 0.2s;
        }

        .input-field-wrapper:focus-within .search-icon-left {
          color: var(--primary);
        }

        .search-input-field {
          width: 100%;
          height: 100%;
          padding: 0 36px 0 38px; /* 左右留出图标位置 */
          border: none;
          background: transparent;
          color: var(--text);
          font-size: 0.9rem;
          font-weight: 500;
          outline: none;
          border-radius: 20px;
        }

        .search-input-field::placeholder {
          color: var(--placeholder);
          font-weight: 400;
          opacity: 0.8;
        }

        /* 清空按钮区域 */
        .clear-btn-wrapper {
            position: absolute;
            right: 8px;
            display: flex;
            align-items: center;
            opacity: 0;
            transform: scale(0.8);
            pointer-events: none;
            transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .clear-btn-wrapper.visible {
            opacity: 1;
            transform: scale(1);
            pointer-events: auto;
        }

        .clear-icon-button {
          width: 20px;
          height: 20px;
          border: none;
          background: var(--backgroundSecondary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--textTertiary);
          transition: all 0.2s ease;
        }

        .clear-icon-button:hover {
          background: var(--textTertiary);
          color: var(--background);
        }
        
        /* 按钮样式微调 */
        .search-btn {
            height: 40px; /* 强制高度对齐 */
            border-radius: 20px; /* 胶囊圆角 */
            padding-left: 20px;
            padding-right: 20px;
            box-shadow: 0 2px 6px rgba(var(--primary-rgb), 0.25);
        }

        @media (max-width: 600px) {
           /* 移动端，隐藏搜索文字按钮，或者让它换行？通常移动端不需要显式搜索按钮，回车即可 */
           .search-action {
               display: none; /* 移动端可以隐藏按钮，让界面更简洁 */
           }
           
           .search-input-field {
               font-size: 16px; /* 防止 iOS 缩放 */
           }
        }
      `}</style>
    </>
  );
};

export default SearchInput;
