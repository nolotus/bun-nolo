// ToolsTab.js (或 .tsx)

import React from "react";
import { FormField } from "web/form/FormField";
import ToolSelector from "ai/tools/ToolSelector"; // 确保导入的是修改后的 ToolSelector
import { Controller } from "react-hook-form"; // 引入 Controller 组件

const ToolsTab = ({ t, errors, register, watch, control }) => {
  // 需要传入 control
  const commonProps = { horizontal: true, labelWidth: "140px" };

  return (
    <div className="tab-content-wrapper">
      <FormField
        label={t("selectTools")}
        help={t("selectToolsHelp")}
        error={errors.tools?.message}
        {...commonProps}
      >
        <Controller
          name="tools" // 这是你在 react-hook-form 中注册的字段名
          control={control} // react-hook-form 的 control 对象
          // Controller 的 render prop 会提供 field, fieldState, formState
          render={({ field }) => (
            <ToolSelector
              // 将 react-hook-form 的当前值传递给 ToolSelector 的 value
              // 确保 field.value 是一个数组，如果它是 undefined 或 null，则默认为空数组
              value={field.value || []}
              // 将 react-hook-form 的 onChange 传递给 ToolSelector 的 onChange
              onChange={field.onChange}
            />
          )}
        />
      </FormField>
    </div>
  );
};

export default ToolsTab;
