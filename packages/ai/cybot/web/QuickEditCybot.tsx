import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { DataType } from "create/types";
import { useTheme } from "app/theme";
import { selectCurrentSpace } from "create/space/spaceSlice";
import { patch } from "database/dbSlice";
import { SyncIcon } from "@primer/octicons-react";

// Components
import Button from "render/web/ui/Button";
import { FormField } from "web/form/FormField";
import Textarea from "web/form/Textarea";
import AllModelsSelector from "ai/llm/AllModelsSelector";
import ReferencesSelector from "./ReferencesSelector";

const QuickEditCybot = ({ initialValues, onClose }) => {
  const space = useAppSelector(selectCurrentSpace);
  const { t } = useTranslation("ai");
  const dispatch = useAppDispatch();
  const theme = useTheme();

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
  const references = watch("references") || [];

  // 提交表单
  const onSubmit = async (data) => {
    await dispatch(
      patch({
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
      <form onSubmit={handleSubmit(onSubmit)}>
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

        {/* 模型选择 */}
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
            defaultModel={initialValues.model}
            t={t}
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

      <style>{`
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
