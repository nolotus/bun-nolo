import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "app/hooks";
import { selectCurrentSpace } from "create/space/spaceSlice";
import TabsNav from "render/web/ui/TabsNav";
import FormTitle from "web/form/FormTitle";
import Button from "render/web/ui/Button";
import useModelPricing from "../hooks/useModelPricing";
import { useOllamaSettings } from "../hooks/useOllamaSettings";
import { useProxySetting } from "../hooks/useProxySetting";
import { useCybotValidation } from "../common/useCybotFormValidation";
import { normalizeReferences } from "../common/createCybotSchema";

import BasicInfoTab from "./BasicInfoTab";
import ReferencesTab from "./ReferencesTab";
import ToolsTab from "./ToolsTab";
import PublishSettingsTab from "./PublishSettingsTab";
import AdvancedSettingsTab from "./AdvancedSettingsTab";

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
  const [activeTab, setActiveTab] = useState(0);
  const [references, setReferences] = useState(() =>
    normalizeReferences(initialValues.references)
  );
  const [smartReadEnabled, setSmartReadEnabled] = useState(
    Boolean(initialValues.smartReadEnabled)
  );

  const space = useAppSelector(selectCurrentSpace);
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

  const { apiSource, setApiSource, isOllama } = useOllamaSettings(
    provider,
    setValue
  );
  const { inputPrice, outputPrice, setInputPrice, setOutputPrice } =
    useModelPricing(provider, watch("model"), setValue);
  const isProxyDisabled = useProxySetting(provider, setValue);

  const tabs = TABS.map((tab) => ({ ...tab, label: t(tab.key) }));

  useEffect(() => {
    setValue("references", references, { shouldDirty: true });
    setValue("smartReadEnabled", smartReadEnabled, { shouldDirty: true });

    if (mode === "edit") {
      const normalizedReferences = normalizeReferences(
        initialValues.references || []
      );
      reset({
        ...initialValues,
        tags: Array.isArray(initialValues.tags)
          ? initialValues.tags.join(", ")
          : initialValues.tags || "",
        references: normalizedReferences,
      });
      setReferences(normalizedReferences);
      setApiSource(
        initialValues.apiKey || initialValues.provider === "ollama"
          ? "custom"
          : "platform"
      );
    }
  }, [
    references,
    smartReadEnabled,
    setValue,
    mode,
    initialValues,
    reset,
    setApiSource,
  ]);

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

  const sharedProps = { t, errors, register, setValue, watch, initialValues };

  const tabComponents = [
    <BasicInfoTab {...sharedProps} control={control} />,
    <ReferencesTab
      {...sharedProps}
      space={space}
      references={references}
      onReferencesChange={handleReferencesChange}
      smartReadEnabled={smartReadEnabled}
      setSmartReadEnabled={setSmartReadEnabled}
    />,
    <ToolsTab {...sharedProps} control={control} />,
    <PublishSettingsTab
      {...sharedProps}
      isPublic={isPublic}
      apiSource={apiSource}
      inputPrice={inputPrice}
      outputPrice={outputPrice}
      setInputPrice={setInputPrice}
      setOutputPrice={setOutputPrice}
    />,
    <AdvancedSettingsTab
      {...sharedProps}
      provider={provider}
      apiSource={apiSource}
      setApiSource={setApiSource}
      useServerProxy={useServerProxy}
      isOllama={isOllama}
      isProxyDisabled={isProxyDisabled}
    />,
  ];

  const isCreate = mode === "create";

  return (
    <div
      className={isCreate ? "create-cybot-container" : "edit-cybot-container"}
    >
      {isCreate && <FormTitle>{t("createCybot")}</FormTitle>}

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="form-header">
          <TabsNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <div className="form-body">
          <div className="tab-content">{tabComponents[activeTab]}</div>
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
