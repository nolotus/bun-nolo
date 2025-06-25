// ReferencesTab.tsx
import React from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormField } from "render/web/form/FormField";

import ToggleSwitch from "web/ui/ToggleSwitch";
import ReferencesSelector from "./ReferencesSelector";

const ReferencesTab = ({ control, errors }) => {
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
        error={referencesError as string}
        {...commonProps}
      >
        <Controller
          name="references"
          control={control}
          defaultValue={[]}
          // [!code ++]
          // 优化：使用对象展开语法 {...field}。
          // 这会自动将 field.value 传递给 'value' prop，
          // 并将 field.onChange 传递给 'onChange' prop。代码更简洁、更标准。
          render={({ field }) => <ReferencesSelector {...field} />}
          // [!code --]
          /*
          render={({ field }) => (
            <ReferencesSelector
              references={field.value}
              onChange={(refs) => field.onChange(refs)}
            />
          )}
          */
        />
      </FormField>
    </div>
  );
};

export default ReferencesTab;
