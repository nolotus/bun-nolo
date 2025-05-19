import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import useModelPricing from "../hooks/useModelPricing";
import { useOllamaSettings } from "../hooks/useOllamaSettings";
import { useCreateCybotValidation } from "../hooks/useCreateCybotValidation";
import { FormField } from "web/form/FormField";
import FormTitle from "web/form/FormTitle";
import { Input } from "web/form/Input";
import { NumberInput } from "web/form/NumberInput";
import TextArea from "web/form/Textarea";
import ToggleSwitch from "web/ui/ToggleSwitch";
import {
  PlusIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@primer/octicons-react";
import Button from "render/web/ui/Button";
import AllModelsSelector from "ai/llm/AllModelsSelector";
import { TagsInput } from "web/form/TagsInput";
import ReferencesSelector from "./ReferencesSelector";
import { useAppSelector } from "app/hooks";
import { selectCurrentSpace } from "create/space/spaceSlice";
import ToolSelector from "ai/tools/ToolSelector";

const CreateCybot: React.FC = () => {
  const { t } = useTranslation("ai");
  const theme = useTheme();
  const [isToolsExpanded, setIsToolsExpanded] = useState(false);

  const {
    form: {
      register,
      handleSubmit,
      watch,
      setValue,
      control,
      formState: { errors, isSubmitting },
    },
    provider,
    isPublic,
    onSubmit,
  } = useCreateCybotValidation();

  const { apiSource } = useOllamaSettings(provider, setValue);
  const [references, setReferences] = useState([]);
  const [smartReadEnabled, setSmartReadEnabled] = useState(false);

  const space = useAppSelector(selectCurrentSpace);
  const { inputPrice, outputPrice, setInputPrice, setOutputPrice } =
    useModelPricing(provider, watch("model"), setValue);

  useEffect(() => {
    setValue("references", references);
    setValue("smartReadEnabled", smartReadEnabled);
  }, [references, smartReadEnabled, setValue]);

  const handleReferencesChange = (newReferences) => {
    setReferences(newReferences);
  };

  return (
    <div className="create-cybot-container">
      <FormTitle>{t("createCybot")}</FormTitle>
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
              <FormField
                label={t("model")}
                required
                error={errors.model?.message}
                horizontal
                labelWidth="140px"
              >
                <AllModelsSelector
                  watch={watch}
                  setValue={setValue}
                  register={register}
                  defaultModel={watch("model")}
                  t={t}
                />
              </FormField>
            </div>
          </section>

          {/* 参考资料选择 */}
          <section className="form-section">
            <div className="section-title">{t("references")}</div>
            <div className="section-content">
              <FormField
                label={t("smartReadCurrentSpace", "智能读取用户当前空间")}
                help={t("smartReadHelp", "启用后将智能读取当前空间的相关内容")}
                horizontal
                labelWidth="140px"
              >
                <ToggleSwitch
                  checked={smartReadEnabled}
                  onChange={(checked) => setSmartReadEnabled(checked)}
                />
              </FormField>
              <FormField
                label={t("selectReferences")}
                help={t("selectReferencesHelp", "选择需要始终使用的参考资料")}
                horizontal
                labelWidth="140px"
                error={errors.references?.message}
              >
                <ReferencesSelector
                  space={space}
                  references={references}
                  onChange={handleReferencesChange}
                  t={t}
                />
              </FormField>
            </div>
          </section>

          {/* 工具选择 - 可折叠 */}
          <section className="form-section">
            <div
              className="section-title collapsible-title"
              onClick={() => setIsToolsExpanded(!isToolsExpanded)}
            >
              {t("toolSelection", "工具选择")}
              {isToolsExpanded ? (
                <ChevronDownIcon className="collapse-icon" />
              ) : (
                <ChevronRightIcon className="collapse-icon" />
              )}
            </div>
            <div
              className={`section-content ${isToolsExpanded ? "expanded" : "collapsed"}`}
            >
              <FormField
                label={t("selectTools", "选择工具")}
                help={t("selectToolsHelp", "请选择要启用的工具")}
                horizontal
                labelWidth="140px"
                error={errors.tools?.message}
              >
                <ToolSelector
                  register={register}
                  defaultValue={watch("tools") || []}
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
                help={
                  apiSource === "platform"
                    ? t("shareInCommunityHelp")
                    : t("shareInCommunityCustomApiHelp")
                }
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
                        value={inputPrice}
                        onChange={setInputPrice}
                        decimal={4}
                        placeholder={t("inputPrice")}
                      />
                      <NumberInput
                        value={outputPrice}
                        onChange={setOutputPrice}
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
        .collapsible-title {
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .collapse-icon {
          margin-left: 8px;
        }
        .collapsed {
          display: none;
        }
        .expanded {
          display: flex;
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

export default CreateCybot;
