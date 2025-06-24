// 文件路径: ai/tools/ToolSelector.tsx (或者 components/ToolSelector.tsx，请根据实际路径调整)

import type React from "react";
import { useState, useEffect } from "react"; // 引入 useState 和 useEffect
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import { toolDescriptions } from "ai/tools/toolRegistry";

//web
import { Checkbox } from "render/web/form/Checkbox"; // 假设这是普通的 Checkbox 组件

// 动态生成工具选项
const TOOL_OPTIONS = Object.entries(toolDescriptions).map(([id, info]) => ({
  id,
  name: info.name,
  description: info.description,
}));

interface ToolSelectorProps {
  // 不再需要 register
  // register: any;

  // 独立组件的 value 和 onChange props
  value: string[]; // 当前选中的工具ID数组
  onChange: (selectedToolIds: string[]) => void; // 选中状态改变时的回调
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({
  value, // 从父组件接收当前值
  onChange, // 从父组件接收值变化的回调
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // 内部状态来管理复选框的选中状态
  // 这个状态由外部的 value prop 初始化，并在内部更新
  const [internalSelectedTools, setInternalSelectedTools] =
    useState<string[]>(value);

  // 当外部 value prop 改变时，同步内部状态
  useEffect(() => {
    setInternalSelectedTools(value);
  }, [value]);

  // 处理单个复选框的改变事件
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const toolId = event.target.value;
    const isChecked = event.target.checked;

    let newSelectedTools;
    if (isChecked) {
      // 选中：添加到数组
      newSelectedTools = [...internalSelectedTools, toolId];
    } else {
      // 取消选中：从数组中移除
      newSelectedTools = internalSelectedTools.filter((id) => id !== toolId);
    }

    // 更新内部状态
    setInternalSelectedTools(newSelectedTools);
    // 通知父组件值已改变
    onChange(newSelectedTools);
  };

  return (
    <div className="tools-wrapper">
      <div className="tools-grid">
        {TOOL_OPTIONS.map((tool) => (
          <label key={tool.id} className="tool-card">
            <div className="tool-main">
              <Checkbox
                id={`tool-${tool.id}`}
                value={tool.id}
                // 控制 Checkbox 的选中状态，基于内部状态
                checked={internalSelectedTools.includes(tool.id)}
                onChange={handleCheckboxChange}
                // 不再使用 register，因为它依赖 react-hook-form
              />
              <div className="tool-title">{t(tool.name)}</div>
            </div>
            <div className="tool-desc">{t(tool.description)}</div>
          </label>
        ))}
      </div>

      <style>{`
        .tools-wrapper {
          width: 100%;
        }

        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 8px;
        }

        .tool-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid ${theme.border};
          background: ${theme.background};
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tool-card:hover {
          background: ${theme.backgroundHover};
          border-color: ${theme.borderHover};
        }

        .tool-main {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tool-title {
          font-size: 14px;
          font-weight: 500;
          color: ${theme.text};
        }

        .tool-desc {
          padding-left: 24px;
          font-size: 13px;
          color: ${theme.textDim};
          line-height: 1.4;
        }

        /* 选中状态 */
        .tool-card:has(:checked) {
          background: ${theme.primaryGhost}30;
          border-color: ${theme.primary};
        }

        /* Focus状态 */
        .tool-card:focus-within {
          outline: none;
          border-color: ${theme.primary};
          box-shadow: 0 0 0 2px ${theme.primaryGhost};
        }

        /* 响应式布局 */
        @media (max-width: 640px) {
          .tools-grid {
            grid-template-columns: 1fr;
            gap: 6px;
          }

          .tool-card {
            padding: 10px;
          }

          .tool-title {
            font-size: 13px;
          }

          .tool-desc {
            font-size: 12px;
            padding-left: 22px;
          }
        }
      `}</style>
    </div>
  );
};

export default ToolSelector;
