// render/ui/LanguageSwitcher.tsx
import React, { useState, useRef, useEffect, memo } from "react";
import { useTranslation } from "react-i18next";
import { Language } from "app/i18n/types";

import { LuLanguages, LuCheck } from "react-icons/lu";

// 使用场景：多语言切换选择器
const languages = [
  { code: Language.EN, name: "English" },
  { code: Language.ZH_CN, name: "简体中文" },
  { code: Language.ZH_HANT, name: "繁體中文" },
  { code: Language.JA, name: "日本語" },
];

const LanguageSwitcher = memo(() => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="lang-switcher" ref={dropdownRef}>
      <button
        className="lang-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="切换语言"
      >
        <LuLanguages size={16} className="lang-icon" />
        <span className="lang-current">{currentLanguage.name}</span>
      </button>

      {isOpen && (
        <div className="lang-dropdown">
          {languages.map((lang) => {
            const isActive = currentLanguage.code === lang.code;
            return (
              <button
                key={lang.code}
                className={`lang-option ${isActive ? "active" : ""}`}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <span className="lang-name">{lang.name}</span>
                {isActive && <LuCheck size={14} />}
              </button>
            );
          })}
        </div>
      )}

      {/* 使用 CSS 变量，而不是 theme 对象 */}
      <style href="language-switcher" precedence="high">{`
        .lang-switcher {
          position: relative;
          display: inline-block;
        }

        .lang-button {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: var(--backgroundSecondary);
          color: var(--textSecondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 120px;
        }

        .lang-button:hover {
          background: var(--backgroundHover);
          border-color: var(--primary);
          color: var(--text);
        }

        .lang-icon {
          flex-shrink: 0;
        }

        .lang-current {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          white-space: nowrap;
        }

        .lang-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + var(--space-2));
          width: 180px;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 10px;
          box-shadow: 0 8px 24px var(--shadowMedium);
          overflow: hidden;
          z-index: 1000;
          animation: fadeIn 0.18s ease-out;
        }

        .lang-option {
          display: flex;
          align-items: center;
          width: 100%;
          padding: var(--space-3) var(--space-4);
          background: transparent;
          color: var(--textSecondary);
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
          gap: var(--space-3);
          font-size: 0.875rem;
        }

        .lang-option:hover {
          background: var(--backgroundHover);
          color: var(--text);
        }

        .lang-option.active {
          background: var(--primaryGhost);
          color: var(--primary);
        }

        .lang-name {
          flex-grow: 1;
          text-align: left;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 768px) {
          .lang-dropdown {
            right: auto;
            left: 0;
            width: 160px;
          }
        }
      `}</style>
    </div>
  );
});

export default LanguageSwitcher;
