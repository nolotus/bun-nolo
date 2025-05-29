import React from "react";
import { FormField } from "web/form/FormField";
import TextArea from "web/form/Textarea";
import ToggleSwitch from "web/ui/ToggleSwitch";
import { NumberInput } from "web/form/NumberInput";

const PublishSettingsTab = ({
  t,
  errors,
  register,
  isPublic,
  setValue,
  apiSource,
  inputPrice,
  outputPrice,
  setInputPrice,
  setOutputPrice,
  initialValues = {},
}) => {
  const commonProps = { horizontal: true, labelWidth: "140px" };

  return (
    <div className="tab-content-wrapper">
      <FormField
        label={t("shareInCommunity")}
        help={
          apiSource === "platform"
            ? t("shareInCommunityHelp")
            : t("shareInCommunityCustomApiHelp")
        }
        {...commonProps}
      >
        <ToggleSwitch
          checked={isPublic}
          onChange={(checked) => setValue("isPublic", checked)}
        />
      </FormField>

      {isPublic && (
        <div className="public-settings-group">
          <FormField
            label={t("greetingMessage")}
            error={errors.greeting?.message}
            help={t("greetingMessageHelp")}
            {...commonProps}
          >
            <TextArea
              {...register("greeting")}
              defaultValue={initialValues.greeting || ""}
              placeholder={t("enterGreetingMessage")}
            />
          </FormField>

          <FormField
            label={t("selfIntroduction")}
            error={errors.introduction?.message}
            help={t("selfIntroductionHelp")}
            {...commonProps}
          >
            <TextArea
              {...register("introduction")}
              defaultValue={initialValues.introduction || ""}
              placeholder={t("enterSelfIntroduction")}
              rows={4}
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
    </div>
  );
};

export default PublishSettingsTab;
