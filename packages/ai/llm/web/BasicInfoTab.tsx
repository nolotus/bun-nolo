// features/agent/tabs/BasicInfoTab.tsx

import React from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { ModelWithProvider } from "ai/llm/models";

//web
import { FormField } from "render/web/form/FormField";
import { Input, TextArea } from "render/web/form/Input";
import { TagsInput } from "render/web/form/TagsInput";
import AllModelsSelector from "ai/llm/AllModelsSelector";

/**
 * BasicInfoTab 组件
 * 负责渲染和管理AI代理的基本信息表单字段。
 * @param {object} props - 组件属性
 * @param {object} props.errors - react-hook-form提供的错误对象
 * @param {object} props.control - react-hook-form提供的control对象
 * @param {function} props.setValue - react-hook-form提供的setValue函数，用于处理副作用
 */
const BasicInfoTab = ({ errors, control, setValue }) => {
  const { t } = useTranslation("ai");
  const commonProps = { horizontal: true, labelWidth: "140px" };

  return (
    <div className="tab-content-wrapper">
      {/* 名称字段 */}
      <FormField
        label={t("form.name")}
        required
        error={errors.name?.message}
        {...commonProps}
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input {...field} placeholder={t("form.namePlaceholder")} />
          )}
        />
      </FormField>

      {/* 问候语字段 (已从发布设置移至此) */}
      <FormField
        label={t("form.greeting")}
        error={errors.greeting?.message}
        {...commonProps}
      >
        <Controller
          name="greeting"
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              placeholder={t("form.defaults.greeting")}
              rows={3}
            />
          )}
        />
      </FormField>

      {/* 模型选择器 */}
      <FormField
        label={t("form.model")}
        required
        error={errors.model?.message}
        {...commonProps}
      >
        <Controller
          name="model"
          control={control}
          render={({ field }) => (
            <AllModelsSelector
              value={field.value}
              onChange={(selectedModel: ModelWithProvider | null) => {
                if (selectedModel) {
                  // 更新模型字段
                  field.onChange(selectedModel.name);
                  // 同步更新提供商字段作为副作用
                  setValue("provider", selectedModel.provider, {
                    shouldValidate: true,
                  });
                } else {
                  // 清空字段
                  field.onChange(null);
                  setValue("provider", "", { shouldValidate: true });
                }
              }}
              error={!!errors.model}
            />
          )}
        />
      </FormField>

      {/* 系统提示词 */}
      <FormField
        label={t("form.prompt")}
        error={errors.prompt?.message}
        help={t("help.prompt")}
        {...commonProps}
      >
        <Controller
          name="prompt"
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              placeholder={t("form.promptPlaceholder")}
              rows={6}
            />
          )}
        />
      </FormField>

      {/* 标签输入 */}
      <FormField
        label={t("form.tags")}
        error={errors.tags?.message}
        help={t("help.tags")}
        {...commonProps}
      >
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <TagsInput
              {...field}
              error={errors.tags}
              placeholder={t("form.tagsPlaceholder")}
            />
          )}
        />
      </FormField>
    </div>
  );
};

export default BasicInfoTab;
