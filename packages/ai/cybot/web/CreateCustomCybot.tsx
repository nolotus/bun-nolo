import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import { useCreateCybotValidation } from "../hooks/useCreateCybotValidation";
import { FormField } from "web/form/FormField";
import FormTitle from "web/form/FormTitle";
import { Input } from "web/form/Input";
import { NumberInput } from "web/form/NumberInput";
import TextArea from "web/form/Textarea";
import ToggleSwitch from "web/ui/ToggleSwitch";
import { PlusIcon } from "@primer/octicons-react";
import Button from "web/ui/Button";
import PasswordInput from "web/form/PasswordInput";
import { TagsInput } from "web/form/TagsInput";
import ReferencesSelector from "./ReferencesSelector";
import { useAppSelector } from "app/hooks";
import { selectCurrentSpace } from "create/space/spaceSlice";

const CreateCustomCybot: React.FC = () => {
  const { t } = useTranslation("ai");
  const theme = useTheme();

  const {
    form: {
      register,
      handleSubmit,
      watch,
      setValue,
      control,
      formState: { errors, isSubmitting },
    },
    isPublic,
    onSubmit,
  } = useCreateCybotValidation();

  // 强制设置 provider 为 "Custom"
  useEffect(() => {
    setValue("provider", "Custom");
    console.log("CreateCustomCybot - provider set to Custom");
  }, [setValue]);

  // 初始化时确保 model 为空，useServerProxy 为 false
  useEffect(() => {
    setValue("model", "");
    setValue("useServerProxy", false); // 默认且固定为 false
    console.log(
      "CreateCustomCybot - model initialized to empty, useServerProxy set to false"
    );
  }, [setValue]);

  const [references, setReferences] = useState([]);
  const space = useAppSelector(selectCurrentSpace);

  // 日志：检查错误和当前值
  console.log("CreateCustomCybot - errors:", errors);
  console.log("CreateCustomCybot - current model value:", watch("model"));
  console.log(
    "CreateCustomCybot - useServerProxy value:",
    watch("useServerProxy")
  );

  // 当 references 更新时，同步到表单数据
  useEffect(() => {
    setValue("references", references);
  }, [references, setValue]);

  return (
    <div className="create-cybot-container">
      <FormTitle>{t("createCustomCybot")}</FormTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-layout">
          {/* 基本信息与行为 */}
          <section className="form-section">
            <div className="section-title">{t("basicInfoAndBehavior")}</div>
            <div className="section-content">
              <FormField
                label={t("cybotName")}
                required
                error={errors.name?.message}
                horizontal
                labelWidth="140px"
              >
                <Input
                  {...register("name")}
                  placeholder={t("enterCybotName")}
                />
              </FormField>
              <FormField
                label={t("prompt")}
                error={errors.prompt?.message}
                help={t("promptHelp")}
                horizontal
                labelWidth="140px"
              >
                <TextArea
                  {...register("prompt")}
                  placeholder={t("enterPrompt")}
                />
              </FormField>
              <FormField
                label={t("tags")}
                error={errors.tags?.message}
                help={t(
                  "tagsHelp",
                  "Enter tags separated by commas (e.g., tag1, tag2)"
                )}
                horizontal
                labelWidth="140px"
              >
                <TagsInput
                  name="tags"
                  control={control}
                  placeholder={t("enterTags")}
                />
              </FormField>
            </div>
          </section>

          {/* 模型配置 */}
          <section className="form-section">
            <div className="section-title">{t("modelConfiguration")}</div>
            <div className="section-content">
              <FormField
                label={t("provider")}
                required
                horizontal
                labelWidth="140px"
              >
                <Input
                  value="Custom"
                  disabled
                  placeholder={t("customProvider")}
                />
              </FormField>
              <FormField
                label={t("providerUrl")}
                error={errors.customProviderUrl?.message}
                help={t("providerUrlHelp")}
                horizontal
                labelWidth="140px"
              >
                <Input
                  {...register("customProviderUrl")}
                  placeholder={t("enterProviderUrl")}
                  type="url"
                />
              </FormField>
              <FormField
                label={t("model")}
                required
                error={errors.model?.message}
                horizontal
                labelWidth="140px"
              >
                <Input
                  {...register("model")}
                  placeholder={t("enterModelName")}
                  onChange={(e) => {
                    console.log("Model input changed:", e.target.value);
                    setValue("model", e.target.value);
                  }}
                />
              </FormField>
              <FormField
                label={t("apiKey")}
                error={errors.apiKey?.message}
                help={t("apiKeyHelp")}
                horizontal
                labelWidth="140px"
              >
                <PasswordInput
                  {...register("apiKey")}
                  placeholder={t("enterApiKey")}
                />
              </FormField>
              <FormField
                label={t("useServerProxy")}
                help={t(
                  "proxyNotAvailableForCustom",
                  "Custom providers must connect directly"
                )} // 新增帮助文本
                horizontal
                labelWidth="140px"
              >
                <ToggleSwitch
                  checked={false} // 固定为 false
                  disabled={true} // 禁用开关
                />
              </FormField>
            </div>
          </section>

          {/* 参考资料选择 */}
          <section className="form-section">
            <div className="section-title">{t("references")}</div>
            <div className="section-content">
              <FormField
                label={t("selectReferences")}
                help={t("selectReferencesHelp", "Select pages to reference")}
                horizontal
                labelWidth="140px"
                error={errors.references?.message}
              >
                <ReferencesSelector
                  space={space}
                  references={references}
                  onChange={setReferences}
                  t={t}
                />
              </FormField>
            </div>
          </section>

          {/* 社区设置 */}
          <section className="form-section">
            <div className="section-title">{t("communitySettings")}</div>
            <div className="section-content">
              <FormField
                label={t("shareInCommunity")}
                help={t("shareInCommunityCustomApiHelp")}
                horizontal
                labelWidth="140px"
              >
                <ToggleSwitch
                  checked={isPublic}
                  onChange={(checked) => setValue("isPublic", checked)}
                />
              </FormField>
              {isPublic && (
                <>
                  <FormField
                    label={t("greetingMessage")}
                    error={errors.greeting?.message}
                    help={t("greetingMessageHelp")}
                    horizontal
                    labelWidth="140px"
                  >
                    <TextArea
                      {...register("greeting")}
                      placeholder={t("enterGreetingMessage")}
                    />
                  </FormField>
                  <FormField
                    label={t("selfIntroduction")}
                    error={errors.introduction?.message}
                    help={t("selfIntroductionHelp")}
                    horizontal
                    labelWidth="140px"
                  >
                    <TextArea
                      {...register("introduction")}
                      placeholder={t("enterSelfIntroduction")}
                    />
                  </FormField>
                  <FormField label={t("pricing")} horizontal labelWidth="140px">
                    <div className="price-inputs">
                      <NumberInput
                        value={watch("inputPrice") || 0}
                        onChange={(value) => setValue("inputPrice", value)}
                        decimal={4}
                        placeholder={t("inputPrice")}
                      />
                      <NumberInput
                        value={watch("outputPrice") || 0}
                        onChange={(value) => setValue("outputPrice", value)}
                        decimal={4}
                        placeholder={t("outputPrice")}
                      />
                    </div>
                  </FormField>
                </>
              )}
            </div>
          </section>
        </div>

        <Button
          type="submit"
          variant="primary"
          block
          size="large"
          loading={isSubmitting}
          disabled={isSubmitting}
          icon={<PlusIcon />}
        >
          {isSubmitting ? t("creating") : t("create")}
        </Button>
      </form>

      <style>{`
        .create-cybot-container {
          max-width: 800px;
          margin: 24px auto;
          padding: 0 24px;
        }
        .form-layout {
          display: flex;
          flex-direction: column;
          gap: 40px;
          margin-bottom: 32px;
        }
        .form-section {
          position: relative;
          padding-left: 16px;
        }
        .section-title {
          font-size: 15px;
          font-weight: 600;
          color: ${theme.textDim};
          margin: 0 0 24px;
          padding-left: 16px;
          position: relative;
          height: 24px;
          line-height: 24px;
        }
        .section-title::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          width: 8px;
          height: 2px;
          background: ${theme.primary};
          opacity: 0.7;
        }
        .section-content {
          display: flex;
          flex-direction: column;
        }
        .price-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 640px) {
          .create-cybot-container {
            padding: 16px;
            margin: 16px auto;
          }
          .form-layout {
            gap: 32px;
          }
          .form-section {
            padding-left: 12px;
          }
          .section-title {
            font-size: 14px;
            margin-bottom: 20px;
          }
          .price-inputs {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateCustomCybot;
