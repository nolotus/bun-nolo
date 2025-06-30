// render/ui/LanguageSwitcher.tsx
import React, { useState, useRef, useEffect, memo } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "app/store";
import { selectTheme } from "app/settings/settingSlice";
import { GlobeIcon, CheckIcon } from "@primer/octicons-react";
import { Language } from "app/i18n/types";

// 使用场景：多语言切换选择器

const languages = [
  { code: Language.EN, name: "English", flag: "🇬🇧" },
  { code: Language.ZH_CN, name: "简体中文", flag: "🇨🇳" },
  { code: Language.ZH_HANT, name: "繁體中文", flag: "🇹🇼" },
  { code: Language.JA, name: "日本語", flag: "🇯🇵" },
];

const LanguageSwitcher = memo(() => {
  const { i18n } = useTranslation();
  const theme = useAppSelector(selectTheme);
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
        <GlobeIcon size={16} />
        <span className="lang-current">
          {currentLanguage.flag} {currentLanguage.name}
        </span>
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
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                {isActive && <CheckIcon size={14} />}
              </button>
            );
          })}
        </div>
      )}

      <style href="language-switcher" precedence="high">{`
        .lang-switcher {
          position: relative;
          display: inline-block;
        }

        .lang-button {
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
          padding: ${theme.space[2]} ${theme.space[3]};
          background: ${theme.backgroundSecondary};
          color: ${theme.textSecondary};
          border: 1px solid ${theme.border};
          border-radius: 8px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 120px;
        }

        .lang-button:hover {
          background: ${theme.backgroundHover};
          border-color: ${theme.primary};
          color: ${theme.text};
        }

        .lang-current {
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
          white-space: nowrap;
        }

        .lang-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + ${theme.space[2]});
          width: 180px;
          background: ${theme.background};
          border: 1px solid ${theme.border};
          border-radius: 10px;
          box-shadow: 0 8px 24px ${theme.shadowMedium};
          overflow: hidden;
          z-index: 1000;
          animation: fadeIn 0.18s ease-out;
        }

        .lang-option {
          display: flex;
          align-items: center;
          width: 100%;
          padding: ${theme.space[3]} ${theme.space[4]};
          background: transparent;
          color: ${theme.textSecondary};
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
          gap: ${theme.space[3]};
          font-size: 0.875rem;
        }

        .lang-option:hover {
          background: ${theme.backgroundHover};
          color: ${theme.text};
        }

        .lang-option.active {
          background: ${theme.primaryGhost};
          color: ${theme.primary};
        }

        .lang-option span:nth-child(2) {
          flex-grow: 1;
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
