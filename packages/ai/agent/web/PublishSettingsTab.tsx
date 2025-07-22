// 路径: app/features/ai/components/PublishSettingsTab.tsx (替换后的完整文件)

import React from "react";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import { FormField } from "render/web/form/FormField";
import { TextArea, NumberInput } from "render/web/form/Input";
import ToggleSwitch from "render/web/ui/ToggleSwitch";
import WhitelistInput from "./WhitelistInput"; // [新增] 导入我们刚刚创建的组件

// 注意：此组件的 props 签名与您最初提供的一致
const PublishSettingsTab = ({ errors, control, watch, apiSource }) => {
  const { t } = useTranslation("ai");

  const commonProps = { horizontal: true, labelWidth: "140px" };

  // 监控 isPublic 的值，以决定是否显示白名单和价格等设置
  const isPublic = watch("isPublic");

  // 这个逻辑保持不变
  const canBePublic = apiSource === "platform";

  return (
    <div className="tab-content-wrapper">
      {/* 1. isPublic 开关，这部分逻辑完全保留 */}
      <FormField
        label={t("form.isPublic", "公开到市场")}
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

      {/* 2. [核心改动] 仅在 isPublic 为 true 时，才渲染这个包含所有公开设置的容器 */}
      {isPublic && (
        <div className="public-settings-group">
          {/* 3. [新增] 白名单设置区域 */}
          <FormField
            label={t("publish.whitelist.label", "白名单")}
            help={t(
              "publish.whitelist.help",
              "留空则所有人都可用。添加用户ID后，将只有名单内用户可以使用此应用。"
            )}
            error={errors.whitelist?.message}
            {...commonProps}
          >
            <Controller
              name="whitelist"
              control={control}
              render={({ field }) => (
                <WhitelistInput value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>

          {/* 4. 您原有的其他公开设置字段保持不变，只是被包裹在了这个容器里 */}
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

      {/* 5. 样式保持不变，它会自动应用于新的 .public-settings-group */}
      <style href="publish-settings" precedence="high">{`
        .public-settings-group {
          margin-top: var(--space-6);
          padding-top: var(--space-6);
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }
        .tab-content-wrapper {
          /* 为外层容器也增加一些间距，让布局更舒展 */
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
      `}</style>
    </div>
  );
};

export default PublishSettingsTab;
