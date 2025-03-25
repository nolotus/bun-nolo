import type React from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "web/form/Checkbox";
import { useTheme } from "app/theme";

// 增加生成表格工具选项
export const TOOL_OPTIONS = [
  {
    id: "makeAppointment",
    name: "makeAppointment",
    description: "Schedule appointments and manage calendar events",
  },
  {
    id: "runCybot",
    name: "runCybot",
    description: "Execute other cybots and combine their capabilities",
  },
  {
    id: "generateTable",
    name: "generateTable",
    description: "根据 JSON 数据生成 Excel 表格",
  },
];

interface ToolSelectorProps {
  register: any;
  defaultValue?: string[];
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({
  register,
  defaultValue = [],
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <div className="tools-wrapper">
      <div className="tools-grid">
        {TOOL_OPTIONS.map((tool) => (
          <label key={tool.id} className="tool-card">
            <div className="tool-main">
              <Checkbox
                id={`tool-${tool.id}`}
                {...register("tools")}
                value={tool.id}
                defaultChecked={defaultValue.includes(tool.id)}
              />
              <div className="tool-title">{t(tool.name)}</div>
            </div>
            <div className="tool-desc">{t(tool.description)}</div>
          </label>
        ))}
      </div>

      <style jsx>{`
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
