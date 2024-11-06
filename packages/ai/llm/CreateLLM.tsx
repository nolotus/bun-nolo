// CreateLLM.tsx

import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "app/hooks";
import { write } from "database/dbSlice";
import { useAuth } from "auth/useAuth";
import withTranslations from "i18n/withTranslations";
import groupBy from "lodash-es/groupBy.js";
import { matchSorter } from "match-sorter";
import {
  Combobox,
  ComboboxGroup,
  ComboboxItem,
  ComboboxSeparator,
  NoResults,
} from "render/combobox";
import { DataType } from "create/types";
import { useNavigate } from "react-router-dom";
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
import { modelEnum } from "./models";
import { defaultAPIs, apiStyleOptions } from "./config";

const CreateLLM: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<LLMFormData>();

  const apiStyle = watch("apiStyle");

  useEffect(() => {
    if (apiStyle && defaultAPIs[apiStyle]) {
      setValue("api", defaultAPIs[apiStyle]);
    }
  }, [apiStyle, setValue]);

  const onSubmit = async (data: LLMFormData) => {
    console.log(data);
    try {
      const writeLLMAction = await dispatch(
        write({
          data: { type: DataType.LLM, ...data },
          flags: { isJSON: true },
          userId: auth.user?.userId,
        }),
      );
      const llmId = writeLLMAction.payload.id;
      navigate(`/${llmId}`);
    } catch (error) {
      console.error("Error creating LLM:", error);
    }
  };

  // Model search functionality
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
    <FormContainer>
      <FormTitle>{t("createLLM")}</FormTitle>
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
        <FormFieldComponent
          label={t("model")}
          name="modelValue"
          register={register}
          errors={errors}
          required
        />
        {/* <FormField>
          <Label htmlFor="model">{t("model")}:</Label>
          <input {}></input>
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
          {errors.model && <ErrorMessage>{errors.model.message}</ErrorMessage>}
        </FormField> */}
        <SubmitButton type="submit">{t("createLLM")}</SubmitButton>
      </form>
    </FormContainer>
  );
};

export default withTranslations(CreateLLM, ["ai"]);
