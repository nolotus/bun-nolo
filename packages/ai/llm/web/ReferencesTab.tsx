// features/agent/tabs/ReferencesTab.tsx

import React from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormField } from "render/web/form/FormField";
import ToggleSwitch from "web/ui/ToggleSwitch";
import ReferencesSelector from "./ReferencesSelector";

const ReferencesTab = ({ control, errors }) => {
  const { t } = useTranslation("ai");
  const commonProps = { horizontal: true, labelWidth: "140px" };

  // This logic is fine for handling Zod's complex error structures for arrays
  const referencesError =
    errors.references?.message ||
    (Array.isArray(errors.references)
      ? errors.references.find((err) => err?.message)?.message
      : null);

  return (
    <div className="tab-content-wrapper">
      <FormField
        label={t("form.smartReadEnabled")}
        help={t("help.smartRead")}
        {...commonProps}
      >
        <Controller
          name="smartReadEnabled"
          control={control}
          render={({ field }) => (
            <ToggleSwitch
              checked={!!field.value}
              onChange={(checked) => field.onChange(checked)}
            />
          )}
        />
      </FormField>

      <FormField
        label={t("references.selectTitle")}
        help={t("references.selectHelp")}
        error={referencesError as string}
        {...commonProps}
      >
        <Controller
          name="references"
          control={control}
          render={({ field }) => (
            // The spread syntax is the cleanest way to connect a standard
            // controlled component with react-hook-form's Controller.
            <ReferencesSelector {...field} />
          )}
        />
      </FormField>
    </div>
  );
};

export default ReferencesTab;
