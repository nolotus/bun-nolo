import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "app/hooks";
import { selectCurrentSpace } from "create/space/spaceSlice";
import useModelPricing from "../../cybot/hooks/useModelPricing";
import { useOllamaSettings } from "../../cybot/hooks/useOllamaSettings";
import { useProxySetting } from "../../cybot/hooks/useProxySetting";
import { useCybotValidation } from "./common/useCybotFormValidation";
import { normalizeReferences } from "./common/createCybotSchema";

//web
import BasicInfoTab from "./BasicInfoTab";
import ReferencesTab from "./ReferencesTab";
import ToolsTab from "./ToolsTab";
import PublishSettingsTab from "./PublishSettingsTab";
import AdvancedSettingsTab from "./AdvancedSettingsTab";

import Button from "render/web/ui/Button";
import FormTitle from "web/form/FormTitle";
import TabsNav from "render/web/ui/TabsNav";

const TABS = [
  { id: 0, key: "basicInfo" },
  { id: 1, key: "references" },
  { id: 2, key: "toolSelection" },
  { id: 3, key: "publishSettings" },
  { id: 4, key: "advancedSettings" },
];

const CybotForm = ({
  mode = "create",
  initialValues = {},
  onClose,
  CreateIcon,
  EditIcon,
}) => {
  const { t } = useTranslation("ai");
  const isCreate = mode === "create";

  // --- hook form ---
  const { form, provider, useServerProxy, isPublic, onSubmit } =
    useCybotValidation(initialValues);
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

  // --- 本地 state ---
  const [references, setReferences] = useState(() =>
    normalizeReferences(initialValues.references)
  );
  const [smartReadEnabled, setSmartReadEnabled] = useState(
    Boolean(initialValues.smartReadEnabled)
  );

  // 1. 仅在编辑模式第一次加载时 初始化表单值
  useEffect(() => {
    if (mode === "edit") {
      const normRefs = normalizeReferences(initialValues.references || []);
      reset({
        ...initialValues,
        tags: Array.isArray(initialValues.tags)
          ? initialValues.tags.join(", ")
          : initialValues.tags || "",
        references: normRefs,
        smartReadEnabled: Boolean(initialValues.smartReadEnabled),
      });
      setReferences(normRefs);
      setSmartReadEnabled(Boolean(initialValues.smartReadEnabled));
      setApiSource(
        initialValues.apiKey || initialValues.provider === "ollama"
          ? "custom"
          : "platform"
      );
    }
    // 仅依赖 mode 和 id，避免重复重置
  }, [mode, initialValues.id, initialValues, reset, setApiSource]);

  // 2. 分别同步 references 和 smartReadEnabled 到表单
  useEffect(() => {
    setValue("references", references, { shouldDirty: true });
  }, [references, setValue]);

  useEffect(() => {
    setValue("smartReadEnabled", smartReadEnabled, { shouldDirty: true });
  }, [smartReadEnabled, setValue]);

  const handleReferencesChange = useCallback(setReferences, []);

  const handleFormSubmit = async (data) => {
    await onSubmit({
      ...data,
      prompt: data.prompt || "",
      greeting: data.greeting || "",
      introduction: data.introduction || "",
    });
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
    <ReferencesTab
      key="references"
      {...sharedProps}
      space={space}
      references={references}
      onReferencesChange={handleReferencesChange}
      smartReadEnabled={smartReadEnabled}
      setSmartReadEnabled={setSmartReadEnabled}
    />,
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
      className={isCreate ? "create-cybot-container" : "edit-cybot-container"}
    >
      {isCreate && <FormTitle>{t("createCybot")}</FormTitle>}

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="form-header">
          <TabsNav
            tabs={tabs}
            activeTab={watch("activeTab") || 0}
            onChange={(idx) => setValue("activeTab", idx)}
          />
          {/* 也可直接用 useState 管理 activeTab */}
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

      <style href="cybot-form" precedence="high">{`
        .create-cybot-container, .edit-cybot-container {
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
          .create-cybot-container, .edit-cybot-container {
            padding: ${isCreate ? "16px" : "0"};
            margin: ${isCreate ? "16px auto" : "0"};
          }
          .footer-actions { flex-direction: column; }
        }
      `}</style>
    </div>
  );
};

export default CybotForm;
