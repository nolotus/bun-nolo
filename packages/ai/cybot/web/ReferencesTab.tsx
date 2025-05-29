import React from "react";
import { FormField } from "web/form/FormField";
import ToggleSwitch from "web/ui/ToggleSwitch";
import ReferencesSelector from "./ReferencesSelector";

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
        error={errors.references?.message}
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
