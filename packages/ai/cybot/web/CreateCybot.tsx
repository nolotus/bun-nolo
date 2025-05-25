import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import { useAppSelector } from "app/hooks";
import { selectCurrentSpace } from "create/space/spaceSlice";

// components
import TabsNav from "render/web/ui/TabsNav";
import { FormField } from "web/form/FormField";
import FormTitle from "web/form/FormTitle";
import { Input } from "web/form/Input";
import { NumberInput } from "web/form/NumberInput";
import TextArea from "web/form/Textarea";
import ToggleSwitch from "web/ui/ToggleSwitch";
import { PlusIcon } from "@primer/octicons-react";
import Button from "render/web/ui/Button";
import AllModelsSelector from "ai/llm/AllModelsSelector";
import { TagsInput } from "web/form/TagsInput";
import ReferencesSelector from "./ReferencesSelector";
import ToolSelector from "ai/tools/ToolSelector";

// hooks
import { useCreateCybotValidation } from "../hooks/useCreateCybotValidation";
import useModelPricing from "../hooks/useModelPricing";
import { useOllamaSettings } from "../hooks/useOllamaSettings";

const CreateCybot: React.FC = () => {
  const { t } = useTranslation("ai");
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

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

  // 定义 Tabs 数据
  const tabs = [
    { id: 0, label: t("basicInfo") },
    { id: 1, label: t("references") },
    { id: 2, label: t("toolSelection") },
    { id: 3, label: t("publishSettings") },
  ];

  return (
    <div className="create-cybot-container">
      <FormTitle>{t("createCybot")}</FormTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TabsNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="tab-content">
          {activeTab === 0 && (
            <section className="form-section">
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
                    rows={6}
                  />
                </FormField>
                <FormField
                  label={t("tags")}
                  error={errors.tags?.message}
                  help={t("tagsHelp")}
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
          )}

          {activeTab === 1 && (
            <section className="form-section">
              <div className="section-content">
                <FormField
                  label={t("smartReadCurrentSpace")}
                  help={t("smartReadHelp")}
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
                  help={t("selectReferencesHelp")}
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
          )}

          {activeTab === 2 && (
            <section className="form-section">
              <div className="section-content">
                <FormField
                  label={t("selectTools")}
                  help={t("selectToolsHelp")}
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
          )}

          {activeTab === 3 && (
            <section className="form-section">
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
                        rows={4}
                      />
                    </FormField>
                    <FormField
                      label={t("pricing")}
                      horizontal
                      labelWidth="140px"
                    >
                      <div className="price-inputs">
                        <NumberInput
                          value={inputPrice}
                          onChange={setInputPrice}
                          decimal={4}
                          placeholder={t("inputPrice")}
                          aria-label={t("inputPricePerThousand")}
                        />
                        <NumberInput
                          value={outputPrice}
                          onChange={setOutputPrice}
                          decimal={4}
                          placeholder={t("outputPrice")}
                          aria-label={t("outputPricePerThousand")}
                        />
                      </div>
                    </FormField>
                  </>
                )}
              </div>
            </section>
          )}
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

      <style jsx>{`
        .create-cybot-container {
          max-width: 800px;
          margin: 24px auto;
          padding: 0 24px;
        }

        .tab-content {
          margin-bottom: 32px;
          min-height: 400px;
        }

        .form-section {
          position: relative;
          padding: 8px 16px;
        }

        .section-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .price-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          align-items: center;
        }

        @media (max-width: 640px) {
          .create-cybot-container {
            padding: 16px;
            margin: 16px auto;
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
