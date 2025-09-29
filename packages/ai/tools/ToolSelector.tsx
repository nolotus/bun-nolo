// ai/tools/ToolSelector.tsx
import type React from "react";
import { useTranslation } from "react-i18next";
import { toolDescriptions } from "ai/tools/toolRegistry";
import { Checkbox } from "render/web/form/Checkbox";

const TOOL_OPTIONS = Object.entries(toolDescriptions).map(([id, info]) => ({
  id,
  name: info.name,
  description: info.description,
}));

interface ToolSelectorProps {
  value: string[];
  onChange: (selectedToolIds: string[]) => void;
  className?: string;
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({
  value = [],
  onChange,
  className = "",
}) => {
  const { t } = useTranslation();

  const handleToolToggle = (toolId: string, isChecked: boolean) => {
    const newSelectedTools = isChecked
      ? [...value, toolId]
      : value.filter((id) => id !== toolId);
    onChange(newSelectedTools);
  };

  return (
    <div className={`tool-selector ${className}`}>
      <div className="tool-grid">
        {TOOL_OPTIONS.map((tool) => {
          const isSelected = value.includes(tool.id);

          return (
            <label
              key={tool.id}
              className={`tool-item ${isSelected ? "selected" : ""}`}
            >
              <div className="tool-header">
                <Checkbox
                  id={`tool-${tool.id}`}
                  value={tool.id}
                  checked={isSelected}
                  onChange={(e) => handleToolToggle(tool.id, e.target.checked)}
                />
                <span className="tool-name">{t(tool.name)}</span>
              </div>
              <div className="tool-description">{t(tool.description)}</div>
            </label>
          );
        })}
      </div>

      <style>{`
        .tool-selector {
          width: 100%;
        }

        .tool-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: var(--space-3);
        }

        .tool-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          padding: var(--space-3);
          border-radius: var(--space-2);
          border: 1px solid var(--border);
          background: var(--background);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .tool-item:hover {
          background: var(--backgroundHover);
          border-color: var(--borderHover);
        }

        .tool-item.selected {
          background: var(--primaryGhost);
          border-color: var(--primary);
        }

        .tool-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .tool-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
          line-height: 1.3;
        }

        .tool-description {
          padding-left: var(--space-5);
          font-size: 12px;
          color: var(--textTertiary);
          line-height: 1.4;
        }

        .tool-item:focus-within {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 2px var(--focus);
        }

        @media (max-width: 600px) {
          .tool-grid {
            grid-template-columns: 1fr;
          }
          
          .tool-item {
            padding: var(--space-3);
          }
        }
      `}</style>
    </div>
  );
};

export default ToolSelector;
