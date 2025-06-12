import React from "react";
import { FormField } from "web/form/FormField";
import ToolSelector from "ai/tools/ToolSelector";
import { Controller } from "react-hook-form";

const ToolsTab = ({ t, errors, control, initialValues = {} }) => {
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
          name="tools"
          control={control}
          defaultValue={initialValues.tools || []}
          render={({ field }) => (
            <ToolSelector value={field.value} onChange={field.onChange} />
          )}
        />
      </FormField>
    </div>
  );
};

export default ToolsTab;
