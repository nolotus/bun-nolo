import React from "react";
import { Controller } from "react-hook-form";
import { FormField } from "web/form/FormField";
import ToggleSwitch from "web/ui/ToggleSwitch";
import ReferencesSelector from "../../llm/web/ReferencesSelector";

const ReferencesTab = ({ t, errors, control, space }) => {
  const commonProps = { horizontal: true, labelWidth: "140px" };

  // 组合 references 字段可能的错误信息
  const referencesError =
    errors.references?.message ||
    (Array.isArray(errors.references)
      ? errors.references.find((err) => err?.message)?.message
      : null);

  return (
    <div className="tab-content-wrapper">
      {/* 智能阅读开关 */}
      <FormField
        label={t("smartReadCurrentSpace")}
        help={t("smartReadHelp")}
        {...commonProps}
      >
        <Controller
          name="smartReadEnabled"
          control={control}
          defaultValue={false}
          render={({ field }) => (
            <ToggleSwitch
              checked={field.value}
              onChange={(checked) => field.onChange(checked)}
            />
          )}
        />
      </FormField>

      {/* 参考文献选择 */}
      <FormField
        label={t("selectReferences")}
        help={t("selectReferencesHelp")}
        error={referencesError}
        {...commonProps}
      >
        <Controller
          name="references"
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <ReferencesSelector
              space={space}
              references={field.value}
              onChange={(refs) => field.onChange(refs)}
              t={t}
            />
          )}
        />
      </FormField>
    </div>
  );
};

export default ReferencesTab;
