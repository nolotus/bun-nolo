// ReferencesTab.tsx
import React from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormField } from "web/form/FormField";
import ToggleSwitch from "web/ui/ToggleSwitch";
import ReferencesSelector from "./ReferencesSelector";

const ReferencesTab = ({ errors, control }) => {
  const { t } = useTranslation("ai");
  const commonProps = { horizontal: true, labelWidth: "140px" };

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
              references={field.value}
              onChange={(refs) => field.onChange(refs)}
            />
          )}
        />
      </FormField>
    </div>
  );
};

export default ReferencesTab;
