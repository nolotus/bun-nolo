// ai/llm/agent/AgentForm.tsx
import React, { useEffect, Activity } from "react";
import { useTranslation } from "react-i18next";

import useModelPricing from "../../llm/hooks/useModelPricing";
import { useOllamaSettings } from "../../llm/hooks/useOllamaSettings";
import { useProxySetting } from "../../llm/hooks/useProxySetting";
import { useAgentValidation } from "../hooks/useAgentFormValidation";
import { normalizeReferences } from "../createAgentSchema";

import BasicInfoTab from "./BasicInfoTab";
import ReferencesTab from "./ReferencesTab";
import ToolsTab from "./ToolsTab";
import PublishSettingsTab from "./PublishSettingsTab";
import AdvancedSettingsTab from "./AdvancedSettingsTab";

import Button from "render/web/ui/Button";
import FormTitle from "render/web/form/FormTitle";
import TabsNav from "render/web/ui/TabsNav";

import { LuPlus, LuRefreshCw } from "react-icons/lu";

const TABS = [
  { id: 0, key: "tabs.basicInfo" },
  { id: 1, key: "tabs.references" },
  { id: 2, key: "tabs.toolSelection" },
  { id: 3, key: "tabs.publishSettings" },
  { id: 4, key: "tabs.advancedSettings" },
];

type AgentFormProps = {
  mode?: "create" | "edit";
  initialValues?: any;
  onClose?: () => void;
};

const AgentForm: React.FC<AgentFormProps> = ({
  mode = "create",
  initialValues = {},
  onClose,
}) => {
  const { t } = useTranslation("ai");
  const isCreate = mode === "create";

  const { form, provider, useServerProxy, isPublic, onSubmit } =
    useAgentValidation(initialValues);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const { apiSource, setApiSource, isOllama } = useOllamaSettings(
    provider,
    setValue
  );
  const { inputPrice, outputPrice, setInputPrice, setOutputPrice } =
    useModelPricing(provider, watch("model"), setValue);
  const isProxyDisabled = useProxySetting(provider, setValue);

  useEffect(() => {
    if (mode === "edit" && initialValues.id) {
      const normRefs = normalizeReferences(initialValues.references || []);
      reset({
        ...initialValues,
        tags: Array.isArray(initialValues.tags)
          ? initialValues.tags.join(", ")
          : initialValues.tags || "",
        references: normRefs,
        smartReadEnabled: Boolean(initialValues.smartReadEnabled),
      });

      const shouldUseCustom =
        Boolean(initialValues.apiKey) || initialValues.provider === "ollama";
      setApiSource(shouldUseCustom ? "custom" : "platform");
    }
  }, [mode, initialValues.id, reset, setApiSource]);

  const handleFormSubmit = async (data: any) => {
    await onSubmit(data);
    if (mode === "edit" && onClose) onClose();
  };

  const tabs = TABS.map((tab) => ({ ...tab, label: t(tab.key) }));
  // 强制转成 number，避免 "0" 和 0 不相等导致判断异常
  const activeTab: number = Number(watch("activeTab") ?? 0);

  const sharedProps = {
    errors,
    register,
    control,
    watch,
    setValue,
    initialValues,
  };

  // 抽成一个函数，按 id 返回对应面板
  const renderTabById = (id: number) => {
    switch (id) {
      case 0:
        return <BasicInfoTab {...sharedProps} />;
      case 1:
        return <ReferencesTab control={control} errors={errors} />;
      case 2:
        return <ToolsTab {...sharedProps} />;
      case 3:
        return (
          <PublishSettingsTab
            {...sharedProps}
            isPublic={isPublic}
            apiSource={apiSource}
            inputPrice={inputPrice}
            outputPrice={outputPrice}
            setInputPrice={setInputPrice}
            setOutputPrice={setOutputPrice}
          />
        );
      case 4:
      default:
        return (
          <AdvancedSettingsTab
            {...sharedProps}
            provider={provider}
            apiSource={apiSource}
            setApiSource={setApiSource}
            useServerProxy={useServerProxy}
            isOllama={isOllama}
            isProxyDisabled={isProxyDisabled}
          />
        );
    }
  };

  return (
    <div
      className={isCreate ? "create-agent-container" : "edit-agent-container"}
    >
      {isCreate && <FormTitle>{t("createAgent")}</FormTitle>}

      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        {/* 顶部 Tab 导航 */}
        <div className="form-header">
          <TabsNav
            tabs={tabs}
            activeTab={activeTab}
            onChange={(id) => setValue("activeTab", id)}
          />
        </div>

        {/* 使用 Activity 的内容区域 */}
        <div className="form-body">
          <div className="tab-content">
            {TABS.map((tab) => (
              <Activity
                key={tab.id}
                mode={activeTab === tab.id ? "visible" : "hidden"}
              >
                <div className="tab-panel">
                  {renderTabById(tab.id as number)}
                </div>
              </Activity>
            ))}
          </div>
        </div>

        <div className="form-footer">
          <div className="footer-actions">
            {!isCreate && (
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
              icon={isCreate ? <LuPlus /> : <LuRefreshCw />}
            >
              {isSubmitting
                ? t(isCreate ? "creating" : "updating")
                : t(isCreate ? "create" : "update")}
            </Button>
          </div>
        </div>
      </form>

      <style href="agent-form" precedence="high">{`
        .create-agent-container, .edit-agent-container {
          max-width: ${isCreate ? "800px" : "auto"};
          margin: ${isCreate ? "24px auto" : "0"};
          padding: ${isCreate ? "0 24px" : "0"};
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .form-header { flex-shrink: 0; }
        .form-body { flex: 1; overflow-y: auto; }

        .tab-content {
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        /* 每个面板的包裹容器，可以按需调整 */
        .tab-panel {
          display: block;
        }

        .form-footer {
          flex-shrink: 0;
          padding: 24px;
          margin-top: 16px;
        }
        .footer-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        @media (max-width: 640px) {
          .create-agent-container, .edit-agent-container {
            padding: ${isCreate ? "16px" : "0"};
            margin: ${isCreate ? "16px auto" : "0"};
          }
          .footer-actions { flex-direction: column; }
        }
      `}</style>
    </div>
  );
};

export default AgentForm;
