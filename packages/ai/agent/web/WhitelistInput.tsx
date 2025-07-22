// 路径: app/features/ai/components/WhitelistInput.tsx (新文件)

import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { LuUserPlus, LuX } from "react-icons/lu";
import Button from "render/web/ui/Button"; // 假设 Button 组件路径
import { Input } from "render/web/form/Input"; // 假设 Input 组件路径

interface WhitelistInputProps {
  // value 和 onChange 由 react-hook-form 的 Controller 自动传入
  // 我们为 value 提供一个默认空数组，以增加组件的健壮性
  value?: string[];
  onChange?: (value: string[]) => void;
}

const WhitelistInput: React.FC<WhitelistInputProps> = ({
  value = [],
  onChange,
}) => {
  const { t } = useTranslation("ai"); // 使用 'ai' 命名空间获取翻译
  const [inputValue, setInputValue] = useState("");

  const handleAddUser = useCallback(() => {
    // 确保输入值不为空，且不在现有列表中
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !value.includes(trimmedValue)) {
      // 通过 onChange 回调，将新数组通知给 react-hook-form
      onChange?.([...value, trimmedValue]);
      setInputValue(""); // 清空输入框
    }
  }, [inputValue, value, onChange]);

  const handleRemoveUser = useCallback(
    (userToRemove: string) => {
      // 通过 onChange 回调，将过滤后的新数组通知给 react-hook-form
      onChange?.(value.filter((user) => user !== userToRemove));
    },
    [value, onChange]
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // 允许用户按回车键添加
    if (event.key === "Enter") {
      event.preventDefault(); // 防止触发表单提交
      handleAddUser();
    }
  };

  return (
    <div className="whitelist-container">
      <div className="whitelist-input-wrapper">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t(
            "publish.whitelist.addPlaceholder",
            "输入用户ID并按回车添加"
          )}
        />
        <Button
          type="button" // 确保按钮类型不是 "submit"
          variant="secondary"
          onClick={handleAddUser}
          icon={<LuUserPlus />}
          disabled={!inputValue.trim()} // 当输入框为空时禁用按钮
        >
          {t("add", "添加")}
        </Button>
      </div>

      {/* 仅在列表不为空时渲染标签容器 */}
      {value.length > 0 && (
        <div className="whitelist-user-list">
          {value.map((user) => (
            <div key={user} className="whitelist-user-tag">
              <span className="whitelist-user-id">{user}</span>
              <button
                type="button"
                className="whitelist-remove-button"
                onClick={() => handleRemoveUser(user)}
                aria-label={`Remove ${user}`}
              >
                <LuX size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 遵循项目规范，将样式内联在组件中 */}
      <style href="whitelist-input-styles" precedence="low">{`
        .whitelist-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          gap: var(--space-3); /* 使用 CSS 变量 */
        }
        .whitelist-input-wrapper {
          display: flex;
          gap: var(--space-2);
        }
        .whitelist-user-list {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          padding-top: var(--space-1);
        }
        .whitelist-user-tag {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          background-color: var(--backgroundSecondary);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: var(--space-1) var(--space-2);
          font-size: 0.9em;
          color: var(--textSecondary);
          transition: background-color 0.2s, box-shadow 0.2s;
        }
        .whitelist-user-tag:hover {
          box-shadow: 0 0 0 1px var(--borderHover);
        }
        .whitelist-user-id {
          word-break: break-all;
        }
        .whitelist-remove-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--textQuaternary);
          border-radius: 50%;
          transition: color 0.2s, background-color 0.2s;
        }
        .whitelist-remove-button:hover {
          color: var(--text);
          background-color: var(--backgroundHover);
        }
      `}</style>
    </div>
  );
};

export default WhitelistInput;
