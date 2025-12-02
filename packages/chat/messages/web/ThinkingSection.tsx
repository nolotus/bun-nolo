import React, { useMemo, memo } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@primer/octicons-react";
import { useAppSelector } from "app/store"; // 假设路径，根据实际情况调整
import { selectShowThinking } from "app/settings/settingSlice"; // 假设路径
import { markdownToSlate } from "create/editor/transforms/markdownToSlate"; // 假设路径
import Editor from "create/editor/Editor"; // 假设路径
import { useThinkingVisibility } from "../../hooks/useThinkingVisibility"; // 假设路径

interface ThinkingSectionProps {
  thinkContent?: string;
  messageContent?: any; // 传入消息正文内容，用于辅助判断自动展开逻辑
  role?: string;
}

export const ThinkingSection = memo(
  ({ thinkContent, messageContent, role }: ThinkingSectionProps) => {
    // 1. 获取全局设置
    const showThinking = useAppSelector(selectShowThinking);

    // 2. 只有非用户角色、有思考内容、且全局开关开启时才渲染
    // 如果你不希望在这里判断 role，也可以由父组件控制
    const shouldRender = role !== "self" && thinkContent && showThinking;

    // 3. 使用 Hook 管理展开/折叠状态
    // 注意：这里我们即使不渲染 UI，Hook 逻辑通常也应该在 Top level，
    // 但为了性能，如果 shouldRender 为 false，我们可以直接返回 null，
    // 只要保证该组件的挂载/卸载是稳定的即可。
    const [isExpanded, toggleThinking] = useThinkingVisibility(
      showThinking,
      messageContent,
      thinkContent
    );

    const slate = useMemo(
      () => (thinkContent ? markdownToSlate(thinkContent) : []),
      [thinkContent]
    );

    if (!shouldRender) return null;

    return (
      <>
        <div className="thinking-container">
          <button
            className="thinking-toggle"
            onClick={toggleThinking}
            aria-expanded={isExpanded}
            type="button"
          >
            <div className="thinking-icon">
              {isExpanded ? (
                <ChevronDownIcon size={14} />
              ) : (
                <ChevronRightIcon size={14} />
              )}
            </div>
            <span className="thinking-label">思考过程</span>
            <div className="thinking-indicator" />
          </button>
          <div
            className={`thinking-content ${isExpanded ? "expanded" : "collapsed"}`}
          >
            {isExpanded && slate.length > 0 && (
              <div className="thinking-editor-wrapper">
                <Editor
                  initialValue={slate}
                  readOnly
                  className="thinking-editor"
                />
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          .thinking-container {
            margin-bottom: var(--space-3);
          }
          .thinking-toggle {
            display: flex;
            align-items: center;
            gap: var(--space-2);
            width: 100%;
            padding: var(--space-2) var(--space-3);
            background: var(--backgroundGhost);
            border: 1px solid var(--primaryGhost);
            border-radius: var(--space-2);
            color: var(--textSecondary);
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition:
              background 0.2s,
              color 0.2s,
              border-color 0.2s;
          }
          .thinking-toggle:hover,
          .thinking-toggle:focus-visible {
            background: var(--primaryGhost);
            color: var(--primary);
            border-color: var(--focus);
            outline: none;
          }
          .thinking-toggle:focus-visible {
            box-shadow: 0 0 0 2px var(--focus);
          }
          .thinking-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary);
          }
          .thinking-label {
            flex: 1;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          .thinking-indicator {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--primary);
            opacity: 0.6;
          }
          .thinking-content {
            overflow: hidden;
            transition:
              max-height 0.3s ease,
              opacity 0.2s ease,
              margin-top 0.2s ease;
          }
          .thinking-content.collapsed {
            max-height: 0;
            opacity: 0;
            margin-top: 0;
          }
          .thinking-content.expanded {
            max-height: 1000px;
            opacity: 1;
            margin-top: var(--space-3);
          }
          .thinking-editor-wrapper {
            position: relative;
            background: var(--backgroundTertiary);
            border: 1px solid var(--border);
            border-radius: var(--space-3);
            overflow: hidden;
          }
          .thinking-editor-wrapper::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--primaryGradient);
          }
          .thinking-editor-wrapper .thinking-editor {
            padding: var(--space-4);
            font-size: 14px;
            color: var(--textTertiary);
            line-height: 1.6;
          }
        `}</style>
      </>
    );
  }
);
