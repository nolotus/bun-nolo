// render/web/ui/SearchInput.tsx
import React from "react";
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <>
      <style href="search-input" precedence="high">{`
        .search-form {
          display: flex;
          flex: 1;
          max-width: 420px;
          min-width: 240px;
        }

        .search-input-wrapper {
          display: flex;
          gap: var(--space-2);
          width: 100%;
          align-items: center;
        }

        .search-input-container {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: var(--space-3);
          width: 16px;
          height: 16px;
          color: var(--textTertiary);
          pointer-events: none;
          z-index: 1;
          transition: color 0.2s ease;
        }

        .search-input {
          width: 100%;
          height: 36px;
          padding: 0 var(--space-10) 0 var(--space-10);
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--background);
          color: var(--text);
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px var(--shadowLight);
        }

        .search-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--focus), 0 1px 2px var(--shadowLight);
        }

        .search-input:focus + .search-icon {
          color: var(--primary);
        }

        .search-input::placeholder {
          color: var(--placeholder);
        }

        .clear-icon-button {
          position: absolute;
          right: var(--space-2);
          top: 50%;
          transform: translateY(-50%);
          width: 22px;
          height: 22px;
          border: none;
          background: var(--backgroundHover);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--textSecondary);
          transition: all 0.2s ease;
          z-index: 2;
          opacity: 0.7;
        }

        .clear-icon-button:hover {
          background: var(--backgroundSelected);
          color: var(--text);
          opacity: 1;
          transform: translateY(-50%) scale(1.05);
        }

        .clear-icon-button:active {
          transform: translateY(-50%) scale(0.95);
        }

        .clear-icon-button svg {
          width: 12px;
          height: 12px;
        }

        .search-button {
          white-space: nowrap;
          min-width: 64px;
          height: 36px;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .search-form {
            max-width: none;
          }

          .search-input-wrapper {
            flex-direction: column;
            gap: var(--space-3);
          }

          .search-input {
            width: 100%;
            height: 40px;
          }

          .search-button {
            width: 100%;
            height: 40px;
          }
        }
      `}</style>

      <form onSubmit={handleSubmit} className={`search-form ${className}`}>
        <div className="search-input-wrapper">
          <div className="search-input-container">
            <LuSearch className="search-icon" />
            <input
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="search-input"
            />
            {value && (
              <button
                type="button"
                onClick={onClear}
                className="clear-icon-button"
                title="清空搜索"
              >
                <LuX />
              </button>
            )}
          </div>
          <Button
            type="submit"
            variant="primary"
            size="small"
            className="search-button"
          >
            搜索
          </Button>
        </div>
      </form>
    </>
  );
};

export default SearchInput;
