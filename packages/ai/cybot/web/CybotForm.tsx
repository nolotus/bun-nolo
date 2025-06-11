import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import { useAppSelector } from "app/hooks";
import { selectCurrentSpace } from "create/space/spaceSlice";
import TabsNav from "render/web/ui/TabsNav";
import FormTitle from "web/form/FormTitle";
import Button from "render/web/ui/Button";
import useModelPricing from "../hooks/useModelPricing";
import { useOllamaSettings } from "../hooks/useOllamaSettings";
import { useProxySetting } from "../hooks/useProxySetting";
import { useCybotValidation } from "../common/useCybotFormValidation";

// 移除对 DEFAULT_Xxx 的导入，因为它们不再在 reset 中使用
// import {
//   DEFAULT_TEMPERATURE,
//   DEFAULT_TOP_P,
//   DEFAULT_FREQUENCY_PENALTY,
//   DEFAULT_PRESENCE_PENALTY,
//   DEFAULT_MAX_TOKENS,
// } from "../common/createCybotSchema";
// const DEFAULT_REASONING_EFFORT = "medium"; // 也移除此行

// 导入更新后的子组件 (假设它们都已按最新建议修改)
import BasicInfoTab from "./BasicInfoTab";
import ReferencesTab from "./ReferencesTab";
import ToolsTab from "./ToolsTab";
import PublishSettingsTab from "./PublishSettingsTab";
import AdvancedSettingsTab from "./AdvancedSettingsTab";

const CybotForm = ({
  mode = "create", // "create" 或 "edit"
  initialValues = {},
  onClose,
  CreateIcon,
  EditIcon,
}) => {
  const { t } = useTranslation("ai");
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const [references, setReferences] = useState(() => {
    const initialRefs = initialValues.references || [];
    if (!Array.isArray(initialRefs)) return [];
    return initialRefs.map((ref) => ({
      ...ref,
      type: ref.type || "knowledge",
    }));
  });

  const [smartReadEnabled, setSmartReadEnabled] = useState(
    initialValues.smartReadEnabled || false
  );

  const space = useAppSelector(selectCurrentSpace);

  const {
    form: {
      register,
      handleSubmit,
      watch,
      setValue,
      reset,
      control,
      formState: { errors, isSubmitting },
    },
    provider,
    useServerProxy,
    isPublic,
    onSubmit,
  } = useCybotValidation(initialValues);

  const { apiSource, setApiSource, isOllama } = useOllamaSettings(
    provider,
    setValue
  );
  const { inputPrice, outputPrice, setInputPrice, setOutputPrice } =
    useModelPricing(provider, watch("model"), setValue);
  const isProxyDisabled = useProxySetting(provider, setValue);

  const tabs = [
    { id: 0, label: t("basicInfo") },
    { id: 1, label: t("references") },
    { id: 2, label: t("toolSelection") },
    { id: 3, label: t("publishSettings") },
    { id: 4, label: t("advancedSettings") },
  ];

  useEffect(() => {
    setValue("references", references, { shouldDirty: true });
    setValue("smartReadEnabled", smartReadEnabled, { shouldDirty: true });
  }, [references, smartReadEnabled, setValue]);

  useEffect(() => {
    if (mode === "edit") {
      // *** 关键修复点：不再为模型参数强制设置默认值 ***
      // 如果 initialValues.field 为 undefined，它在 react-hook-form 中也将是 undefined。
      reset({
        ...initialValues,
        tags: Array.isArray(initialValues.tags)
          ? initialValues.tags.join(", ")
          : initialValues.tags || "",
        useServerProxy: initialValues.useServerProxy ?? true,
        isPublic: initialValues.isPublic ?? false,
        // 这些模型参数现在直接从 initialValues 获取，如果 initialValues 中是 undefined，
        // 则在 react-hook-form 内部也会是 undefined。
        temperature: initialValues.temperature,
        top_p: initialValues.top_p,
        frequency_penalty: initialValues.frequency_penalty,
        presence_penalty: initialValues.presence_penalty,
        max_tokens: initialValues.max_tokens,
        reasoning_effort: initialValues.reasoning_effort,
      });
      setApiSource(
        initialValues.apiKey || initialValues.provider === "ollama"
          ? "custom"
          : "platform"
      );
    }
  }, [initialValues, reset, setApiSource, mode]);

  const handleReferencesChange = useCallback(
    (newReferences) => setReferences(newReferences),
    []
  );

  const handleFormSubmit = async (data) => {
    // 确保这些字段在提交时是空字符串，即使它们在 UI 中被清空
    await onSubmit({
      ...data,
      prompt: data.prompt || "",
      greeting: data.greeting || "",
      introduction: data.introduction || "",
    });
    if (mode === "edit" && onClose) {
      onClose();
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <BasicInfoTab
            t={t}
            errors={errors}
            register={register}
            control={control}
            watch={watch}
            setValue={setValue}
            initialValues={initialValues}
          />
        );

      case 1:
        return (
          <ReferencesTab
            t={t}
            errors={errors}
            space={space}
            references={references}
            onReferencesChange={handleReferencesChange}
            smartReadEnabled={smartReadEnabled}
            setSmartReadEnabled={setSmartReadEnabled}
          />
        );

      case 2:
        return (
          <ToolsTab
            t={t}
            errors={errors}
            register={register}
            watch={watch}
            control={control}
          />
        );

      case 3:
        return (
          <PublishSettingsTab
            t={t}
            errors={errors}
            register={register}
            isPublic={isPublic}
            setValue={setValue}
            apiSource={apiSource}
            inputPrice={inputPrice}
            outputPrice={outputPrice}
            setInputPrice={setInputPrice}
            setOutputPrice={setOutputPrice}
            initialValues={initialValues}
          />
        );

      case 4:
        return (
          <AdvancedSettingsTab
            t={t}
            errors={errors}
            register={register}
            setValue={setValue}
            theme={theme}
            watch={watch}
            provider={provider}
            apiSource={apiSource}
            setApiSource={setApiSource}
            useServerProxy={useServerProxy}
            isOllama={isOllama}
            isProxyDisabled={isProxyDisabled}
            initialValues={initialValues} // 继续传递 initialValues 给 AdvancedSettingsTab
          />
        );

      default:
        return null;
    }
  };

  const containerClass =
    mode === "create" ? "create-cybot-container" : "edit-cybot-container";
  const title =
    mode === "create" ? <FormTitle>{t("createCybot")}</FormTitle> : null;
  const submitLabel =
    mode === "create"
      ? isSubmitting
        ? t("creating")
        : t("create")
      : isSubmitting
        ? t("updating")
        : t("update");
  const submitIcon = mode === "create" ? <CreateIcon /> : <EditIcon />;
  const showCancelButton = mode === "edit";

  return (
    <div className={containerClass}>
      {title}
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="form-header">
          <TabsNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <div className="form-body">
          <div className="tab-content">{renderTabContent()}</div>
        </div>

        <div className="form-footer">
          <div className="footer-actions">
            {showCancelButton && (
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {t("cancel")}
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
              icon={submitIcon}
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      </form>

      <style>{`
        .create-cybot-container, .edit-cybot-container {
          max-width: ${mode === "create" ? "800px" : "auto"};
          margin: ${mode === "create" ? "24px auto" : "0"};
          padding: ${mode === "create" ? "0 24px" : "0"};
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .form-header {
          flex-shrink: 0;
        }

        .form-body {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .tab-content-wrapper {
          padding: ${theme.space?.[8] || "32px"} ${theme.space?.[6] || "24px"};
          display: flex;
          flex-direction: column;
          gap: ${theme.space?.[8] || "32px"};
        }

        .form-footer {
          flex-shrink: 0;
          padding: ${theme.space?.[6] || "24px"};
          margin-top: ${theme.space?.[4] || "16px"};
        }

        .footer-actions {
          display: flex;
          justify-content: flex-end;
          gap: ${theme.space?.[3] || "12px"};
        }

        .price-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: ${theme.space?.[4] || "16px"};
        }

        .public-settings-group,
        .api-settings-group {
          margin-top: ${theme.space?.[8] || "32px"};
          padding-top: ${theme.space?.[6] || "24px"};
          display: flex;
          flex-direction: column;
          gap: ${theme.space?.[6] || "24px"};
        }

        .model-parameters {
          margin-top: ${theme.space?.[12] || "48px"};
          padding-top: ${theme.space?.[8] || "32px"};
        }

        .parameters-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: ${theme.space?.[8] || "32px"};
        }

        .parameters-header h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          color: ${theme.text};
        }

        .parameters-grid {
          display: flex;
          flex-direction: column;
          gap: ${theme.space?.[6] || "24px"};
        }

        .parameter-item {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: ${theme.space?.[4] || "16px"};
          align-items: start;
          min-height: 60px;
        }

        .parameter-label {
          display: flex;
          align-items: center;
          gap: ${theme.space?.[2] || "8px"};
          padding-top: ${theme.space?.[1] || "4px"};
        }

        .label-text {
          font-size: 14px;
          font-weight: 500;
          color: ${theme.text};
        }

        .info-icon {
          color: ${theme.textTertiary};
          cursor: help;
          transition: color 0.15s ease;
          flex-shrink: 0;
        }

        .info-icon:hover {
          color: ${theme.primary};
        }

        .parameter-control {
          display: flex;
          flex-direction: column;
          gap: ${theme.space?.[3] || "12px"};
        }

        .parameter-info {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: ${theme.textTertiary};
        }

        .parameter-current {
          font-weight: 500;
          color: ${theme.primary};
          font-family: 'SF Mono', Consolas, 'Roboto Mono', monospace;
        }

        @media (max-width: 640px) {
          .create-cybot-container, .edit-cybot-container {
            padding: ${mode === "create" ? "16px" : "0"};
            margin: ${mode === "create" ? "16px auto" : "0"};
          }

          .tab-content-wrapper {
            padding: ${theme.space?.[6] || "24px"} ${theme.space?.[4] || "16px"};
            gap: ${theme.space?.[6] || "24px"};
          }
          
          .form-footer {
            padding: ${theme.space?.[4] || "16px"};
          }
          
          .footer-actions {
            flex-direction: column;
          }
          
          .price-inputs {
            grid-template-columns: 1fr;
          }

          .parameter-item {
            grid-template-columns: 1fr;
            gap: ${theme.space?.[3] || "12px"};
            min-height: auto;
          }

          .parameter-label {
            padding-top: 0;
          }

          .parameters-header {
            flex-direction: column;
            align-items: flex-start;
            gap: ${theme.space?.[4] || "16px"};
          }
        }

        .form-body::-webkit-scrollbar {
          width: 4px;
        }

        .form-body::-webkit-scrollbar-thumb {
          background-color: ${theme.textLight};
          border-radius: 2px;
          opacity: 0.3;
        }
      `}</style>
    </div>
  );
};

export default CybotForm;
