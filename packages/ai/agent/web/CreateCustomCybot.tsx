import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import { useAgentValidation } from "../hooks/useAgentFormValidation";
import { FormField } from "render/web/form/FormField";

import FormTitle from "render/web/form/FormTitle";
import { Input, TextArea, PasswordInput } from "render/web/form/Input";

import { PlusIcon } from "@primer/octicons-react";
import Button from "render/web/ui/Button";

import { TagsInput } from "render/web/form/TagsInput";

import { useAppSelector } from "app/store";
import { selectCurrentSpace } from "create/space/spaceSlice";
import ToggleSwitch from "render/web/ui/ToggleSwitch";
import PublishSettingsTab from "./PublishSettingsTab";
import ReferencesSelector from "./ReferencesSelector"; // 确保路径正确

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
    onSubmit,
  } = useAgentValidation();

  const [inputPrice, setInputPrice] = useState<number | undefined>(
    watch("inputPrice")
  );
  const [outputPrice, setOutputPrice] = useState<number | undefined>(
    watch("outputPrice")
  );

  useEffect(() => {
    setValue("inputPrice", inputPrice);
  }, [inputPrice, setValue]);

  useEffect(() => {
    setValue("outputPrice", outputPrice);
  }, [outputPrice, setValue]);

  // 设置表单字段的初始/默认值
  useEffect(() => {
    setValue("provider", "Custom");
    setValue("customProviderUrl", "http://localhost:11434/v1/chat/completions"); // 设置Ollama地址
    setValue("model", "");
    setValue("useServerProxy", false);
  }, [setValue]);

  const [references, setReferences] = useState([]);
  const space = useAppSelector(selectCurrentSpace);

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
                help={t(
                  "providerUrlOllamaHelp",
                  "Defaults to local Ollama. Change if your API is hosted elsewhere."
                )}
                horizontal
                labelWidth="140px"
              >
                <Input
                  {...register("customProviderUrl")}
                  placeholder="http://localhost:11434/v1/chat/completions"
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
                />
              </FormField>
              <FormField
                label={t("apiKey")}
                error={errors.apiKey?.message}
                help={t("apiKeyHelpOllama", "For Ollama, can be left blank.")}
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
                )}
                horizontal
                labelWidth="140px"
              >
                <ToggleSwitch checked={false} disabled={true} />
              </FormField>
            </div>
          </section>

          {/* 参考资料选择 */}
          <section className="form-section">
            <div className="section-title">{t("references")}</div>
            <div className="section-content">
              <FormField
                label={t("selectReferences")}
                help={t(
                  "selectReferencesWithTypeHelp",
                  "Select pages and mark them as knowledge or instruction."
                )}
                horizontal
                labelWidth="140px"
                error={errors.references?.message}
              >
                <ReferencesSelector
                  space={space}
                  references={references}
                  onChange={setReferences}
                />
              </FormField>
            </div>
          </section>

          {/* 社区设置 */}
          <section className="form-section">
            <div className="section-title">{t("communitySettings")}</div>
            <div className="section-content">
              <PublishSettingsTab
                t={t}
                errors={errors}
                control={control}
                watch={watch}
                apiSource="custom"
                inputPrice={inputPrice}
                outputPrice={outputPrice}
                setInputPrice={setInputPrice}
                setOutputPrice={setOutputPrice}
                initialValues={{}}
              />
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
        }
      `}</style>
    </div>
  );
};

export default CreateCustomCybot;
