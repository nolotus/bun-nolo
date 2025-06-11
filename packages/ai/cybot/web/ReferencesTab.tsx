import React from "react";
import { FormField } from "web/form/FormField";
import ToggleSwitch from "web/ui/ToggleSwitch";
import ReferencesSelector from "./ReferencesSelector";

// 在 ReferencesTab.tsx 中
const ReferencesTab = ({
  t,
  errors,
  space,
  references,
  onReferencesChange,
  smartReadEnabled,
  setSmartReadEnabled,
}) => {
  const commonProps = { horizontal: true, labelWidth: "140px" };

  // 👇 --- 处理 references 的错误显示 --- 👇
  const referencesError =
    errors.references?.message ||
    (Array.isArray(errors.references)
      ? errors.references.find((err) => err?.message)?.message
      : null);

  return (
    <div className="tab-content-wrapper">
      <FormField
        label={t("smartReadCurrentSpace")}
        help={t("smartReadHelp")}
        {...commonProps}
      >
        <ToggleSwitch
          checked={smartReadEnabled}
          onChange={setSmartReadEnabled}
        />
      </FormField>

      <FormField
        label={t("selectReferences")}
        help={t("selectReferencesHelp")}
        error={referencesError} // 显示 references 相关的错误
        {...commonProps}
      >
        <ReferencesSelector
          space={space}
          references={references}
          onChange={onReferencesChange}
          t={t}
        />
      </FormField>
    </div>
  );
};
export default ReferencesTab;
