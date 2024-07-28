import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { write } from "database/dbSlice";
import { useAuth } from "auth/useAuth";
import withTranslations from "i18n/withTranslations";
import groupBy from "lodash-es/groupBy.js";
import { matchSorter } from "match-sorter";
import styled, { ThemeProvider } from "styled-components";
import {
  Combobox,
  ComboboxGroup,
  ComboboxItem,
  ComboboxSeparator,
  NoResults,
} from "render/combobox";
import { DataType } from "create/types";
import { modelEnum } from "../llm/models";
import { selectTheme } from "app/theme/themeSlice";

const apiStyleOptions = ["ollama", "openai", "claude"];

const defaultAPIs = {
  ollama: "http://localhost:11434/api/chat",
  openai: "https://api.openai.com/v1/chat/completions",
  claude: "https://api.anthropic.com/v1/complete",
};

const FormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: ${(props) => props.theme.surface1};
  color: ${(props) => props.theme.text1};
`;

const FormTitle = styled.h2`
  text-align: center;
  color: ${(props) => props.theme.text1};
`;

const FormField = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  color: ${(props) => props.theme.text2};
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid ${(props) => props.theme.surface3};
  border-radius: 4px;
  background-color: ${(props) => props.theme.surface2};
  color: ${(props) => props.theme.text1};
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid ${(props) => props.theme.surface3};
  border-radius: 4px;
  background-color: ${(props) => props.theme.surface2};
  color: ${(props) => props.theme.text1};
`;

const ErrorMessage = styled.span`
  color: ${(props) => props.theme.accentColor};
  font-size: 0.8em;
`;

const SubmitButton = styled.button`
  background-color: ${(props) => props.theme.accentColor};
  color: ${(props) => props.theme.surface1};
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const CreateLLM: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const theme = useAppSelector(selectTheme);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm();

  const apiStyle = watch("apiStyle");

  useEffect(() => {
    if (apiStyle && defaultAPIs[apiStyle]) {
      setValue("api", defaultAPIs[apiStyle]);
    }
  }, [apiStyle, setValue]);

  const onSubmit = async (data: any) => {
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
      // 这里可以添加创建LLM后的额外操作
    } catch (error) {
      // 错误处理
      console.error("Error creating LLM:", error);
    }
  };

  // Model 搜索功能
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
    <ThemeProvider theme={theme}>
      <FormContainer>
        <FormTitle>{t("createLLM")}</FormTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormField>
            <Label htmlFor="name">{t("llmName")}:</Label>
            <Input
              id="name"
              {...register("name", { required: t("llmNameRequired") })}
            />
            {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
          </FormField>

          <FormField>
            <Label htmlFor="apiStyle">{t("llmAPIStyle")}:</Label>
            <Select
              id="apiStyle"
              {...register("apiStyle", { required: t("llmAPIStyleRequired") })}
            >
              <option value="">{t("selectAPIStyle")}</option>
              {apiStyleOptions.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </Select>
            {errors.apiStyle && (
              <ErrorMessage>{errors.apiStyle.message}</ErrorMessage>
            )}
          </FormField>

          <FormField>
            <Label htmlFor="api">{t("llmAPI")}:</Label>
            <Input
              id="api"
              {...register("api", { required: t("llmAPIRequired") })}
            />
            {errors.api && <ErrorMessage>{errors.api.message}</ErrorMessage>}
          </FormField>

          <FormField>
            <Label htmlFor="keyName">{t("apiKeyName")}:</Label>
            <Input id="keyName" {...register("keyName")} />
          </FormField>

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

          <SubmitButton type="submit">{t("createLLM")}</SubmitButton>
        </form>
      </FormContainer>
    </ThemeProvider>
  );
};

export default withTranslations(CreateLLM, ["ai"]);
