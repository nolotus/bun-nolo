import React from "react";
import { FormField } from "render/web/form/FormField";
import { TextArea, NumberInput } from "render/web/form/Input";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import ToggleSwitch from "web/ui/ToggleSwitch";

const PublishSettingsTab = ({ errors, control, watch, apiSource }) => {
  const { t } = useTranslation("ai");

  const commonProps = { horizontal: true, labelWidth: "140px" };
  const isPublic = watch("isPublic");
  const canBePublic = apiSource === "platform";

  return (
    <div className="tab-content-wrapper">
      {/* 分享开关 */}
      <FormField
        label={t("form.isPublic")}
        help={canBePublic ? t("help.isPublic") : t("help.isPublicCustomApi")}
        {...commonProps}
      >
        <Controller
          name="isPublic"
          control={control}
          render={({ field }) => (
            <ToggleSwitch
              checked={field.value}
              onChange={field.onChange}
              disabled={!canBePublic}
            />
          )}
        />
      </FormField>

      {/* 公开发布设置 */}
      {isPublic && (
        <div className="public-settings-group">
          {/* [移除] "问候语" 字段已移至 BasicInfoTab */}

          {/* "自我介绍" 字段保留，因为它与公开展示强相关 */}
          <FormField
            label={t("form.introduction")}
            error={errors.introduction?.message}
            {...commonProps}
          >
            <Controller
              name="introduction"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  placeholder={t("form.introductionPlaceholder")}
                  rows={4}
                />
              )}
            />
          </FormField>

          {/* 价格设置 */}
          <FormField label={t("form.inputPrice")} {...commonProps}>
            <Controller
              name="inputPrice"
              control={control}
              render={({ field }) => (
                <NumberInput
                  {...field}
                  decimal={4}
                  placeholder={t("form.inputPricePlaceholder")}
                />
              )}
            />
          </FormField>

          <FormField label={t("form.outputPrice")} {...commonProps}>
            <Controller
              name="outputPrice"
              control={control}
              render={({ field }) => (
                <NumberInput
                  {...field}
                  decimal={4}
                  placeholder={t("form.outputPricePlaceholder")}
                />
              )}
            />
          </FormField>
        </div>
      )}

      <style href="publish-settings" precedence="high">{`
        .public-settings-group {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--border-color, #e2e8f0);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
      `}</style>
    </div>
  );
};

export default PublishSettingsTab;
