import React from "react";
import { FormField } from "web/form/FormField";
import { Input } from "web/form/Input";
import TextArea from "web/form/Textarea";
import { TagsInput } from "web/form/TagsInput";
import AllModelsSelector from "ai/llm/AllModelsSelector";

const BasicInfoTab = ({
  t,
  errors,
  register,
  control,
  watch,
  setValue,
  initialValues = {},
}) => {
  const commonProps = { horizontal: true, labelWidth: "140px" };

  return (
    <div className="tab-content-wrapper">
      <FormField
        label={t("cybotName")}
        required
        error={errors.name?.message}
        {...commonProps}
      >
        <Input
          {...register("name")}
          defaultValue={initialValues.name || ""}
          placeholder={t("enterCybotName")}
        />
      </FormField>

      <FormField
        label={t("model")}
        required
        error={errors.model?.message}
        {...commonProps}
      >
        <AllModelsSelector
          watch={watch}
          setValue={setValue}
          register={register}
          defaultValue={initialValues.model || ""}
          t={t}
        />
      </FormField>

      <FormField
        label={t("prompt")}
        error={errors.prompt?.message}
        help={t("promptHelp")}
        {...commonProps}
      >
        <TextArea
          {...register("prompt")}
          defaultValue={initialValues.prompt || ""}
          onChange={(e) =>
            setValue("prompt", e.target.value, { shouldDirty: true })
          }
          placeholder={t("enterPrompt")}
          rows={6}
        />
      </FormField>

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
