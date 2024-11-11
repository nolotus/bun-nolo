import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "app/hooks";
import { useAuth } from "auth/useAuth";
import withTranslations from "i18n/withTranslations";
import groupBy from "lodash-es/groupBy.js";
import { matchSorter } from "match-sorter";
import { Dialog } from "render/ui/Dialog";
import {
  FormContainer,
  FormTitle,
  FormFieldComponent,
  SubmitButton,
  FormField,
  Label,
  ErrorMessage,
} from "render/CommonFormComponents";
import { LLMFormData } from "ai/types";
import { modelEnum } from "../llm/models";
import { DataType } from "create/types";
import {
  Combobox,
  ComboboxGroup,
  ComboboxItem,
  ComboboxSeparator,
  NoResults,
} from "render/combobox";
import { setData } from "database/dbSlice";

const apiStyleOptions = ["ollama", "openai", "claude"];

const defaultAPIs = {
  ollama: "http://localhost:11434/api/chat",
  openai: "https://api.openai.com/v1/chat/completions",
  claude: "https://api.anthropic.com/v1/complete",
};

const EditLLM: React.FC<{
  initialValues: LLMFormData;
  onClose: () => void;
}> = ({ initialValues, onClose }) => {
  const llmId = initialValues.id;

  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const auth = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<LLMFormData>({
    defaultValues: initialValues,
  });

  const apiStyle = watch("apiStyle");

  useEffect(() => {
    if (apiStyle && defaultAPIs[apiStyle] && !initialValues) {
      setValue("api", defaultAPIs[apiStyle]);
    }
  }, [apiStyle, setValue]);

  const onSubmit = async (data: LLMFormData) => {
    const chatRobotConfig = { ...data, type: DataType.LLM };
    await dispatch(
      setData({
        id: llmId,
        data: chatRobotConfig,
      }),
    );
    onClose();
  };

  const [modelValue, setModelValue] = useState("");
  const deferredModelValue = React.useDeferredValue(modelValue);

  const modelOptions = useMemo(() => {
    return Object.entries(modelEnum).map(([key, value]) => ({
      name: key,
      type: "Models",
    }));
  }, []);

  const matches = useMemo(() => {
    const items = matchSorter(modelOptions, deferredModelValue, {
      keys: ["name"],
    });
    return Object.entries(groupBy(items, "type"));
  }, [deferredModelValue, modelOptions]);

  return (
    <Dialog isOpen={!!llmId} onClose={onClose} title={t("editLLM")}>
      <FormContainer>
        <FormTitle>{t("editLLM")}</FormTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormFieldComponent
            label={t("llmName")}
            name="name"
            register={register}
            errors={errors}
            required
          />
          <FormFieldComponent
            label={t("llmAPIStyle")}
            name="apiStyle"
            register={register}
            errors={errors}
            required
            as="select"
            options={apiStyleOptions.map((style) => ({
              value: style,
              label: style,
            }))}
          />
          <FormFieldComponent
            label={t("llmAPI")}
            name="api"
            register={register}
            errors={errors}
            required
          />
          <FormFieldComponent
            label={t("apiKeyName")}
            name="keyName"
            register={register}
            errors={errors}
          />
          <FormField>
            <Label htmlFor="model">{t("model")}:</Label>
            <Controller
              name="model"
              control={control}
              rules={{ required: t("modelRequired") }}
              render={({ field }) => (
                <Combobox
                  autoSelect
                  autoComplete="both"
                  placeholder={t("searchModels")}
                  value={modelValue}
                  onChange={(value) => {
                    setModelValue(value);
                    field.onChange(value);
                  }}
                >
                  {matches.length ? (
                    matches.map(([type, items], i) => (
                      <React.Fragment key={type}>
                        <ComboboxGroup label={type}>
                          {items.map((item) => (
                            <ComboboxItem key={item.name} value={item.name} />
                          ))}
                        </ComboboxGroup>
                        {i < matches.length - 1 && <ComboboxSeparator />}
                      </React.Fragment>
                    ))
                  ) : (
                    <NoResults>{t("noModelsFound")}</NoResults>
                  )}
                </Combobox>
              )}
            />
            {errors.model && (
              <ErrorMessage>{errors.model.message}</ErrorMessage>
            )}
          </FormField>
          <SubmitButton type="submit">{t("saveChanges")}</SubmitButton>
        </form>
      </FormContainer>
    </Dialog>
  );
};

export default withTranslations(EditLLM, ["ai"]);
