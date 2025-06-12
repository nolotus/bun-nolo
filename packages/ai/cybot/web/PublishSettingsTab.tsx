import React from "react";
import { FormField } from "web/form/FormField";
import TextArea from "web/form/Textarea";
import ToggleSwitch from "web/ui/ToggleSwitch";
import { NumberInput } from "web/form/NumberInput";
import { Controller } from "react-hook-form";

const PublishSettingsTab = ({
  t,
  errors,
  control,
  watch,
  apiSource,
  inputPrice,
  outputPrice,
  setInputPrice,
  setOutputPrice,
  initialValues = {},
}) => {
  const commonProps = { horizontal: true, labelWidth: "140px" };
  const isPublic = watch("isPublic");

  return (
    <div className="tab-content-wrapper">
      {/* 分享开关 */}
      <FormField
        label={t("shareInCommunity")}
        help={
          apiSource === "platform"
            ? t("shareInCommunityHelp")
            : t("shareInCommunityCustomApiHelp")
        }
        {...commonProps}
      >
        <Controller
          name="isPublic"
          control={control}
          defaultValue={initialValues.isPublic ?? false}
          render={({ field }) => (
            <ToggleSwitch checked={field.value} onChange={field.onChange} />
          )}
        />
      </FormField>

      {/* 公开发布设置 */}
      {isPublic && (
        <div className="public-settings-group">
          <FormField
            label={t("greetingMessage")}
            error={errors.greeting?.message}
            help={t("greetingMessageHelp")}
            {...commonProps}
          >
            <Controller
              name="greeting"
              control={control}
              defaultValue={initialValues.greeting || ""}
              render={({ field }) => (
                <TextArea {...field} placeholder={t("enterGreetingMessage")} />
              )}
            />
          </FormField>

          <FormField
            label={t("selfIntroduction")}
            error={errors.introduction?.message}
            help={t("selfIntroductionHelp")}
            {...commonProps}
          >
            <Controller
              name="introduction"
              control={control}
              defaultValue={initialValues.introduction || ""}
              render={({ field }) => (
                <TextArea
                  {...field}
                  placeholder={t("enterSelfIntroduction")}
                  rows={4}
                />
              )}
            />
          </FormField>

          <FormField label={t("pricing")} {...commonProps}>
            <div className="price-inputs">
              <NumberInput
                value={inputPrice ?? 0}
                onChange={setInputPrice}
                decimal={4}
                placeholder={t("inputPrice")}
                aria-label={t("inputPricePerThousand")}
              />
              <NumberInput
                value={outputPrice ?? 0}
                onChange={setOutputPrice}
                decimal={4}
                placeholder={t("outputPrice")}
                aria-label={t("outputPricePerThousand")}
              />
            </div>
          </FormField>
        </div>
      )}

      <style href="publish-settings" precedence="high">{`
        .public-settings-group {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid var(--border, #e2e8f0);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .price-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 640px) {
          .price-inputs {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default PublishSettingsTab;
