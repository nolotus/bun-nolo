// File: /chat/messages/web/MessageToolConfirmBar.tsx
import React, { useMemo, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "app/store";
import {
  selectToolRunsByMessageId,
  executeToolRun,
} from "ai/tools/toolRunSlice";

interface MessageToolConfirmBarProps {
  messageId?: string;
  isRobot: boolean;
}

export const MessageToolConfirmBar: React.FC<MessageToolConfirmBarProps> = ({
  messageId,
  isRobot,
}) => {
  const dispatch = useAppDispatch();

  const toolRuns = useAppSelector((state) =>
    messageId ? selectToolRunsByMessageId(state, messageId) : []
  );

  const confirmRun = useMemo(
    () => toolRuns.find((run) => run.interaction === "confirm"),
    [toolRuns]
  );

  const handleConfirmExecute = useCallback(() => {
    if (!confirmRun) return;
    // 避免重复点击
    if (confirmRun.status === "running") return;
    dispatch(executeToolRun({ id: confirmRun.id }));
  }, [dispatch, confirmRun]);

  if (!isRobot || !confirmRun) return null;

  const { status, toolName, error, input } = confirmRun;

  // 按状态决定按钮文案和禁用态
  let buttonLabel = "";
  let buttonDisabled = false;

  if (status === "running") {
    buttonLabel = "正在执行…";
    buttonDisabled = true;
  } else if (status === "succeeded") {
    if (toolName === "applyDiff") {
      buttonLabel = "补丁已应用";
    } else {
      buttonLabel = `已执行 ${toolName}`;
    }
    buttonDisabled = true;
  } else if (status === "failed") {
    if (toolName === "applyDiff") {
      buttonLabel = "重试应用补丁";
    } else {
      buttonLabel = `重试执行 ${toolName}`;
    }
  } else {
    // pending / 预览后还未真正执行
    if (toolName === "applyDiff") {
      buttonLabel = "应用这个补丁（危险操作）";
    } else {
      buttonLabel = `执行 ${toolName}（需要确认）`;
    }
  }

  // 成功/失败状态行文案
  let statusText: string | null = null;
  let statusClass: "success" | "failed" | null = null;

  if (status === "succeeded") {
    if (toolName === "applyDiff") {
      const filePath = input?.filePath || "";
      statusText = filePath
        ? `✅ 已成功将补丁应用到 ${filePath}。`
        : "✅ 已成功执行 applyDiff。";
    } else {
      statusText = `✅ 已成功执行 ${toolName}。`;
    }
    statusClass = "success";
  } else if (status === "failed") {
    statusText = `❌ 执行失败：${error || "未知错误"}`;
    statusClass = "failed";
  }

  return (
    <div className="tool-confirm-row">
      <button
        type="button"
        className="tool-confirm-button"
        onClick={handleConfirmExecute}
        disabled={buttonDisabled}
      >
        {buttonLabel}
      </button>
      {statusText && (
        <div
          className={`tool-confirm-status ${
            statusClass === "success" ? "success" : "failed"
          }`}
        >
          {statusText}
        </div>
      )}
    </div>
  );
};
