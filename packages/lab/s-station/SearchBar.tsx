import React from "react";
import { FiSearch } from "react-icons/fi";

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  placeholder = "搜索...", // Default placeholder
}) => {
  return (
    <div className="search-container">
      <div className="search-wrapper">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {/* 清除按钮 */}
        {searchTerm && (
          <button
            className="clear-button"
            onClick={() => setSearchTerm("")} // 使用 prop 函数
            aria-label="清除搜索内容" // Accessibility
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
