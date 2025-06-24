import React from "react";
import { Controller } from "react-hook-form";
import { FormField } from "web/form/FormField";
import { Input, TextArea } from "web/form/Input";
import { TagsInput } from "web/form/TagsInput";
import AllModelsSelector from "ai/llm/AllModelsSelector";

const BasicInfoTab = ({
  t,
  errors,
  control,
  watch,
  setValue,
  initialValues = {},
}) => {
  const commonProps = { horizontal: true, labelWidth: "140px" };

  return (
    <div className="tab-content-wrapper">
      {/* 名称字段：使用 Controller 受控 */}
      <FormField
        label={t("cybotName")}
        required
        error={errors.name?.message}
        {...commonProps}
      >
        <Controller
          name="name"
          control={control}
          defaultValue={initialValues.name || ""}
          render={({ field }) => (
            <Input {...field} placeholder={t("enterCybotName")} />
          )}
        />
      </FormField>

      {/* 模型选择，保持原来写法 */}
      <FormField
        label={t("model")}
        required
        error={errors.model?.message}
        {...commonProps}
      >
        <AllModelsSelector
          watch={watch}
          setValue={setValue}
          register={(field) => field}
          defaultValue={initialValues.model || ""}
          t={t}
        />
      </FormField>

      {/* Prompt 字段：同样用 Controller */}
      <FormField
        label={t("prompt")}
        error={errors.prompt?.message}
        help={t("promptHelp")}
        {...commonProps}
      >
        <Controller
          name="prompt"
          control={control}
          defaultValue={initialValues.prompt || ""}
          render={({ field }) => (
            <TextArea {...field} placeholder={t("enterPrompt")} rows={6} />
          )}
        />
      </FormField>

      {/* Tags 使用原生 TagsInput */}
      <FormField
        label={t("tags")}
        error={errors.tags?.message}
        help={t("tagsHelp")}
        {...commonProps}
      >
        <TagsInput
          name="tags"
          control={control}
          defaultValue={initialValues.tags}
          placeholder={t("enterTags")}
        />
      </FormField>
    </div>
  );
};

export default BasicInfoTab;
