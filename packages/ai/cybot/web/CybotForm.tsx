import React, { useState, useEffect, useCallback, useMemo } from "react";
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

// 导入更新后的子组件
import BasicInfoTab from "./BasicInfoTab";
import ReferencesTab from "./ReferencesTab";
import ToolsTab from "./ToolsTab";
import PublishSettingsTab from "./PublishSettingsTab";
import AdvancedSettingsTab from "./AdvancedSettingsTab";

// 数据兼容性处理函数
const normalizeReferences = (references) => {
  if (!Array.isArray(references)) return [];

  return references.map((ref) => ({
    ...ref,
    // 兼容性处理：将旧的 "page" 类型转换为 "knowledge"
    type: ref.type === "page" ? "knowledge" : ref.type || "knowledge",
  }));
};

const CybotForm = ({
  mode = "create",
  initialValues = {},
  onClose,
  CreateIcon,
  EditIcon,
}) => {
  const { t } = useTranslation("ai");
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  // 修改 references 的初始化，处理数据兼容性
  const [references, setReferences] = useState(() => {
    const initialRefs = initialValues.references;
    return normalizeReferences(initialRefs);
  });

  const [smartReadEnabled, setSmartReadEnabled] = useState(
    Boolean(initialValues.smartReadEnabled)
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

  const tabs = useMemo(
    () => [
      { id: 0, label: t("basicInfo") },
      { id: 1, label: t("references") },
      { id: 2, label: t("toolSelection") },
      { id: 3, label: t("publishSettings") },
      { id: 4, label: t("advancedSettings") },
    ],
    [t]
  );

  useEffect(() => {
    setValue("references", references, { shouldDirty: true });
  }, [references, setValue]);

  useEffect(() => {
    setValue("smartReadEnabled", smartReadEnabled, { shouldDirty: true });
  }, [smartReadEnabled, setValue]);

  useEffect(() => {
    if (mode === "edit") {
      // 处理编辑模式下的数据重置，包括兼容性处理
      const normalizedReferences = normalizeReferences(
        initialValues.references || []
      );

      reset({
        ...initialValues,
        tags: Array.isArray(initialValues.tags)
          ? initialValues.tags.join(", ")
          : initialValues.tags || "",
        useServerProxy: initialValues.useServerProxy ?? true,
        isPublic: initialValues.isPublic ?? false,
        references: normalizedReferences, // 使用规范化的 references
        temperature: initialValues.temperature,
        top_p: initialValues.top_p,
        frequency_penalty: initialValues.frequency_penalty,
        presence_penalty: initialValues.presence_penalty,
        max_tokens: initialValues.max_tokens,
        reasoning_effort: initialValues.reasoning_effort,
      });

      // 同时更新组件状态
      setReferences(normalizedReferences);

      setApiSource(
        initialValues.apiKey || initialValues.provider === "ollama"
          ? "custom"
          : "platform"
      );
    }
  }, [initialValues, reset, setApiSource, mode]);

  const handleReferencesChange = useCallback((newReferences) => {
    console.log("[CybotForm] References changed:", newReferences);
    setReferences(newReferences);
  }, []);

  const handleFormSubmit = async (data) => {
    console.log("[CybotForm] Form submit data:", data);
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

  // 使用对象映射替代switch语句
  const tabComponents = useMemo(
    () => ({
      0: (
        <BasicInfoTab
          t={t}
          errors={errors}
          register={register}
          control={control}
          watch={watch}
          setValue={setValue}
          initialValues={initialValues}
        />
      ),
      1: (
        <ReferencesTab
          t={t}
          errors={errors}
          space={space}
          references={references}
          onReferencesChange={handleReferencesChange}
          smartReadEnabled={smartReadEnabled}
          setSmartReadEnabled={setSmartReadEnabled}
        />
      ),
      2: (
        <ToolsTab
          t={t}
          errors={errors}
          register={register}
          watch={watch}
          control={control}
        />
      ),
      3: (
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
      ),
      4: (
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
          initialValues={initialValues}
        />
      ),
    }),
    [
      t,
      errors,
      register,
      control,
      watch,
      setValue,
      initialValues,
      space,
      references,
      handleReferencesChange,
      smartReadEnabled,
      setSmartReadEnabled,
      isPublic,
      apiSource,
      inputPrice,
      outputPrice,
      setInputPrice,
      setOutputPrice,
      theme,
      provider,
      setApiSource,
      useServerProxy,
      isOllama,
      isProxyDisabled,
    ]
  );

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
          <div className="tab-content">{tabComponents[activeTab] || null}</div>
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

      {/* 样式代码保持不变 */}
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
          padding: ${theme.space[8]} ${theme.space[6]};
          display: flex;
          flex-direction: column;
          gap: ${theme.space[8]};
        }

        .form-footer {
          flex-shrink: 0;
          padding: ${theme.space[6]};
          margin-top: ${theme.space[4]};
        }

        .footer-actions {
          display: flex;
          justify-content: flex-end;
          gap: ${theme.space[3]};
        }

        .price-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: ${theme.space[4]};
        }

        .public-settings-group,
        .api-settings-group {
          margin-top: ${theme.space[8]};
          padding-top: ${theme.space[6]};
          display: flex;
          flex-direction: column;
          gap: ${theme.space[6]};
        }

        .model-parameters {
          margin-top: ${theme.space[12]};
          padding-top: ${theme.space[8]};
        }

        .parameters-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: ${theme.space[8]};
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
          gap: ${theme.space[6]};
        }

        .parameter-item {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: ${theme.space[4]};
          align-items: start;
          min-height: 60px;
        }

        .parameter-label {
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
          padding-top: ${theme.space[1]};
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
          gap: ${theme.space[3]};
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
            padding: ${theme.space[6]} ${theme.space[4]};
            gap: ${theme.space[6]};
          }
          
          .form-footer {
            padding: ${theme.space[4]};
          }
          
          .footer-actions {
            flex-direction: column;
          }
          
          .price-inputs {
            grid-template-columns: 1fr;
          }

          .parameter-item {
            grid-template-columns: 1fr;
            gap: ${theme.space[3]};
            min-height: auto;
          }

          .parameter-label {
            padding-top: 0;
          }

          .parameters-header {
            flex-direction: column;
            align-items: flex-start;
            gap: ${theme.space[4]};
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
