import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { DataType } from "create/types";
import { useTheme } from "app/theme";
import { selectCurrentSpace } from "create/space/spaceSlice";
import { patchData } from "database/dbSlice";
import { getModelsByProvider } from "ai/llm/providers";
import { SyncIcon } from "@primer/octicons-react";

// Components
import Button from "web/ui/Button";
import ToggleSwitch from "web/ui/ToggleSwitch";
import { FormField } from "web/form/FormField";
import { Input } from "web/form/Input";
import Textarea from "web/form/Textarea";
import FormTitle from "web/form/FormTitle";
import ModelSelector from "ai/llm/ModelSelector";
import ReferencesSelector from "./ReferencesSelector";

const QuickEditCybot = ({ initialValues, onClose }) => {
  const space = useAppSelector(selectCurrentSpace);
  const { t } = useTranslation("ai");
  const dispatch = useAppDispatch();
  const theme = useTheme();

  // 直接获取provider值，不允许修改
  const provider = initialValues.provider;
  const isCustomProvider = provider === "Custom";

  // 表单初始化
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: initialValues,
  });

  // 基本状态
  const useServerProxy = watch("useServerProxy");
  const references = watch("references") || [];
  const [models, setModels] = useState([]);

  // 加载模型列表
  useEffect(() => {
    const modelsList = getModelsByProvider(provider);
    setModels(modelsList);
  }, [provider]);

  // 提交表单
  const onSubmit = async (data) => {
    await dispatch(
      patchData({
        dbKey: initialValues.dbKey || initialValues.id,
        changes: {
          ...data,
          type: DataType.CYBOT,
        },
      })
    );
    onClose();
  };

  return (
    <div className="quick-edit-container">
      <FormTitle>{t("quickEdit")}</FormTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 名称 */}
        <FormField
          label={t("cybotName")}
          required
          error={errors.name?.message}
          horizontal
          labelWidth="140px"
        >
          <Input {...register("name")} placeholder={t("enterCybotName")} />
        </FormField>

        {/* 提示词 */}
        <FormField
          label={t("prompt")}
          error={errors.prompt?.message}
          help={t("promptHelp")}
          horizontal
          labelWidth="140px"
        >
          <Textarea {...register("prompt")} placeholder={t("enterPrompt")} />
        </FormField>

        {/* 提供商 - 只读 */}
        <FormField label={t("provider")} horizontal labelWidth="140px">
          <Input value={provider} disabled readOnly />
        </FormField>

        {/* 自定义URL - 始终显示 */}
        <FormField
          label={t("providerUrl")}
          error={errors.customProviderUrl?.message}
          horizontal
          labelWidth="140px"
        >
          <Input
            {...register("customProviderUrl")}
            placeholder={t("enterProviderUrl")}
            type="url"
          />
        </FormField>

        {/* 模型选择 */}
        <FormField
          label={t("model")}
          required
          error={errors.model?.message}
          horizontal
          labelWidth="140px"
        >
          <ModelSelector
            isCustomProvider={isCustomProvider}
            models={models}
            watch={watch}
            setValue={setValue}
            register={register}
            defaultModel={initialValues.model}
            t={t}
          />
        </FormField>

        {/* 服务器代理 */}
        <FormField
          label={t("useServerProxy")}
          help={t("proxyHelp")}
          horizontal
          labelWidth="140px"
        >
          <ToggleSwitch
            checked={useServerProxy}
            onChange={(checked) => setValue("useServerProxy", checked)}
          />
        </FormField>

        {/* 引用选择器 */}
        <FormField label={t("references")} horizontal labelWidth="140px">
          <ReferencesSelector
            space={space}
            references={references}
            onChange={(newReferences) => setValue("references", newReferences)}
            t={t}
          />
        </FormField>

        {/* 提交按钮 */}
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
      </form>

      <style jsx>{`
        .quick-edit-container {
          max-width: 800px;
          margin: 24px auto;
          padding: 0 24px;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 24px;
        }
      `}</style>
    </div>
  );
};

export default QuickEditCybot;
