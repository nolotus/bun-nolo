import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "app/hooks";
import { selectCurrentSpace } from "create/space/spaceSlice";
import useModelPricing from "../hooks/useModelPricing";
import { useOllamaSettings } from "../hooks/useOllamaSettings";
import { useProxySetting } from "../hooks/useProxySetting";
import { useAgentValidation } from "../common/useAgentFormValidation";
import { normalizeReferences } from "../common/createAgentSchema";

// web
import BasicInfoTab from "./BasicInfoTab";
import ReferencesTab from "./ReferencesTab";
import ToolsTab from "./ToolsTab";
import PublishSettingsTab from "./PublishSettingsTab";
import AdvancedSettingsTab from "./AdvancedSettingsTab";

import Button from "render/web/ui/Button";
import FormTitle from "render/web/form/FormTitle";
import TabsNav from "render/web/ui/TabsNav";

// 1. [修改] 更新 TABS 的 key 以匹配新的 i18n 结构
const TABS = [
  { id: 0, key: "tabs.basicInfo" },
  { id: 1, key: "tabs.references" },
  { id: 2, key: "tabs.toolSelection" },
  { id: 3, key: "tabs.publishSettings" },
  { id: 4, key: "tabs.advancedSettings" },
];

const AgentForm = ({
  mode = "create",
  initialValues = {},
  onClose,
  CreateIcon,
  EditIcon,
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

  const space = useAppSelector(selectCurrentSpace);
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

      setApiSource(
        initialValues.apiKey || initialValues.provider === "ollama"
          ? "custom"
          : "platform"
      );
    }
  }, [mode, initialValues.id, reset, setApiSource]);

  // 2. [优化] 简化提交函数。Zod schema已处理了默认值，无需手动设置。
  const handleFormSubmit = async (data) => {
    await onSubmit(data); // 直接传递 data 即可
    if (mode === "edit" && onClose) onClose();
  };

  const tabs = TABS.map((tab) => ({ ...tab, label: t(tab.key) }));

  const sharedProps = {
    errors,
    register,
    control,
    watch,
    setValue,
    initialValues,
  };

  const tabComponents = [
    <BasicInfoTab key="basicInfo" {...sharedProps} />,
    <ReferencesTab key="references" control={control} errors={errors} />,
    <ToolsTab key="tools" {...sharedProps} />,
    <PublishSettingsTab
      key="publish"
      {...sharedProps}
      isPublic={isPublic}
      apiSource={apiSource}
      inputPrice={inputPrice}
      outputPrice={outputPrice}
      setInputPrice={setInputPrice}
      setOutputPrice={setOutputPrice}
    />,
    <AdvancedSettingsTab
      key="advanced"
      {...sharedProps}
      provider={provider}
      apiSource={apiSource}
      setApiSource={setApiSource}
      useServerProxy={useServerProxy}
      isOllama={isOllama}
      isProxyDisabled={isProxyDisabled}
    />,
  ];

  return (
    <div
      className={isCreate ? "create-agent-container" : "edit-agent-container"}
    >
      {isCreate && <FormTitle>{t("createAgent")}</FormTitle>}

      {/* 3. [最佳实践] 添加 noValidate 禁用浏览器默认验证 */}
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <div className="form-header">
          <TabsNav
            tabs={tabs}
            activeTab={watch("activeTab") || 0}
            onChange={(idx) => setValue("activeTab", idx)}
          />
        </div>

        <div className="form-body">
          <div className="tab-content">
            {tabComponents[watch("activeTab") || 0]}
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
              icon={isCreate ? <CreateIcon /> : <EditIcon />}
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
        .tab-content-wrapper {
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          gap: 32px;
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
