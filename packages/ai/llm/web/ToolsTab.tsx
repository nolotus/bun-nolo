// features/agent/tabs/ToolsTab.tsx

import React from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormField } from "render/web/form/FormField";
import ToolSelector from "ai/tools/ToolSelector";

/**
 * ToolsTab 组件
 * 负责渲染和管理AI代理可使用的工具选择器。
 * @param {object} props - 组件属性
 * @param {object} props.errors - react-hook-form 提供的错误对象
 * @param {object} props.control - react-hook-form 提供的 control 对象
 */
const ToolsTab = ({ errors, control }) => {
  const { t } = useTranslation("ai");
  const commonProps = { horizontal: true, labelWidth: "140px" };

  // 假设 ToolSelector 是一个标准的受控组件，接收 `value` 和 `onChange`
  return (
    <div className="tab-content-wrapper">
      <FormField
        // 1. [修正] 使用更合适的 i18n 键
        label={t("form.tools")}
        help={t("help.tools")}
        error={errors.tools?.message}
        {...commonProps}
      >
        <Controller
          name="tools"
          control={control}
          // 2. [简化] 移除冗余的 defaultValue
          render={({ field }) => (
            <ToolSelector
              value={field.value || []} // 确保 value 始终是数组
              onChange={field.onChange}
            />
          )}
        />
      </FormField>
    </div>
  );
};

export default ToolsTab;
