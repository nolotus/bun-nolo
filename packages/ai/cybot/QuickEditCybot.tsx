import { useAppDispatch } from "app/hooks";
import { DataType } from "create/types";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { pick } from "rambda";
import { useTheme } from "app/theme";

// components
import Button from "web/ui/Button";
import ToggleSwitch from "web/ui/ToggleSwitch";
import { SyncIcon, CheckIcon } from "@primer/octicons-react";
import { FormField } from "web/form/FormField";
import { Input } from "web/form/Input";
import Textarea from "web/form/Textarea";
import { Combobox } from "web/form/Combobox";
import FormTitle from "web/form/FormTitle";

// data & types
import { patchData } from "database/dbSlice";
import {
  getModelsByProvider,
  availableProviderOptions,
} from "../llm/providers";
import type { Model } from "../llm/types";
import ToolSelector from "../tools/ToolSelector";

const getOrderedProviderOptions = () => {
  return [
    { name: "Custom" },
    ...availableProviderOptions.map((item) => ({ name: item })),
  ];
};

const QuickEditCybot = ({ initialValues, onClose }) => {
  const { t } = useTranslation("ai");
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      ...initialValues,
      name: initialValues.name || "",
      prompt: initialValues.prompt || "",
      model: initialValues.model || "",
      tools: initialValues.tools || [],
      useServerProxy: initialValues.useServerProxy ?? true,
    },
  });

  const provider = watch("provider");
  const useServerProxy = watch("useServerProxy");

  const [models, setModels] = useState<Model[]>([]);
  const isCustomProvider = provider === "Custom";

  // 监听 Provider 变化更新模型列表
  useEffect(() => {
    if (!isCustomProvider) {
      const modelsList = getModelsByProvider(provider || "");
      setModels(modelsList);
      if (modelsList.length > 0 && !initialValues.model) {
        setValue("model", modelsList[0].name);
      }
    }
  }, [provider, setValue, isCustomProvider, initialValues.model]);

  const onSubmit = async (data) => {
    const submitData = { ...data, type: DataType.CYBOT };
    // 只更新核心字段
    const allowedKeys = [
      "name",
      "prompt",
      "provider",
      "customProviderUrl",
      "model",
      "useServerProxy",
      "tools",
    ];

    const changes = pick(allowedKeys, submitData);

    await dispatch(
      patchData({
        id: initialValues.id,
        changes,
      })
    );
    onClose();
  };

  return (
    <div className="quick-edit-container">
      <FormTitle>{t("quickEdit")}</FormTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 基础信息 */}
        <div className="form-section">
          <FormField
            label={t("cybotName")}
            required
            error={errors.name?.message}
            horizontal // 明确设置为水平布局
          >
            <Input {...register("name")} placeholder={t("enterCybotName")} />
          </FormField>

          <FormField
            label={t("prompt")}
            error={errors.prompt?.message}
            help={t("promptHelp")}
            horizontal // 明确设置为水平布局
          >
            <Textarea {...register("prompt")} placeholder={t("enterPrompt")} />
          </FormField>
        </div>

        {/* 模型配置 */}
        <div className="form-section">
          <FormField
            label={t("provider")}
            required
            error={errors.provider?.message}
            horizontal // 明确设置为水平布局
          >
            <Combobox
              items={getOrderedProviderOptions()}
              selectedItem={provider ? { name: provider } : null}
              onChange={(item) => {
                setValue("provider", item?.name || "");
                if (!isCustomProvider) {
                  setValue("customProviderUrl", "");
                  setValue("model", "");
                }
              }}
              labelField="name"
              valueField="name"
              placeholder={t("selectProvider")}
            />
          </FormField>

          {isCustomProvider && (
            <FormField
              label={t("providerUrl")}
              error={errors.customProviderUrl?.message}
              horizontal // 明确设置为水平布局
            >
              <Input
                {...register("customProviderUrl")}
                placeholder={t("enterProviderUrl")}
                type="url"
              />
            </FormField>
          )}

          <FormField
            label={t("model")}
            required
            error={errors.model?.message}
            horizontal // 明确设置为水平布局
          >
            {isCustomProvider ? (
              <Input {...register("model")} placeholder={t("enterModelName")} />
            ) : (
              <Combobox
                items={models}
                selectedItem={
                  models.find((model) => watch("model") === model.name) || null
                }
                onChange={(item) => setValue("model", item?.name || "")}
                labelField="name"
                valueField="name"
                placeholder={t("selectModel")}
                renderOptionContent={(item, isHighlighted, isSelected) => (
                  <div className="model-option">
                    <span>{item.name}</span>
                    <div className="model-indicators">
                      {item.hasVision && (
                        <span className="vision-badge">
                          {t("supportsVision")}
                        </span>
                      )}
                      {isSelected && (
                        <CheckIcon size={16} className="check-icon" />
                      )}
                    </div>
                  </div>
                )}
              />
            )}
          </FormField>

          <FormField
            label={t("useServerProxy")}
            help={t("proxyHelp")}
            horizontal // 明确设置为水平布局
          >
            <ToggleSwitch
              checked={useServerProxy}
              onChange={(checked) => setValue("useServerProxy", checked)}
            />
          </FormField>
        </div>

        {/* 工具设置 */}
        <div className="form-section">
          <FormField
            label={t("tools")}
            help={t("toolsHelp")}
            horizontal // 明确设置为水平布局
          >
            <ToolSelector register={register} />
          </FormField>
        </div>

        <Button
          type="submit"
          variant="primary"
          block
          size="large"
          loading={isSubmitting}
          disabled={isSubmitting}
          icon={<SyncIcon />}
        >
          {isSubmitting ? t("updating") : t("update")}
        </Button>

        <style jsx>{`
          .quick-edit-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 24px;
          }

          .form-section {
            display: grid;
            gap: 20px;
            margin-bottom: 24px;
          }

          .model-option {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
          }

          .model-indicators {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .vision-badge {
            background: ${theme.primaryGhost};
            color: ${theme.primary};
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
          }

          .check-icon {
            color: ${theme.primary};
          }

          :global(.model-option span) {
            font-size: 14px;
            color: ${theme.text};
          }
        `}</style>
      </form>
    </div>
  );
};

export default QuickEditCybot;
