import React from "react";
import { FormField } from "web/form/FormField";
import ToolSelector from "ai/tools/ToolSelector";

const ToolsTab = ({ t, errors, register, watch }) => {
  const commonProps = { horizontal: true, labelWidth: "140px" };

  return (
    <div className="tab-content-wrapper">
      <FormField
        label={t("selectTools")}
        help={t("selectToolsHelp")}
        error={errors.tools?.message}
        {...commonProps}
      >
        <ToolSelector register={register} defaultValue={watch("tools") || []} />
      </FormField>
    </div>
  );
};

export default ToolsTab;
