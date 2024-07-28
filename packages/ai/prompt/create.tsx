import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { write } from "database/dbSlice";
import { useAuth } from "auth/useAuth";
import withTranslations from "i18n/withTranslations";
import styled, { ThemeProvider } from "styled-components";
import { DataType } from "create/types";
import { selectTheme } from "app/theme/themeSlice";

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

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid ${(props) => props.theme.surface3};
  border-radius: 4px;
  background-color: ${(props) => props.theme.surface2};
  color: ${(props) => props.theme.text1};
  min-height: 100px;
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

const CreatePrompt: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const theme = useAppSelector(selectTheme);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    console.log(data);
    try {
      const writePromptAction = await dispatch(
        write({
          data: { type: DataType.Prompt, ...data },
          flags: { isJSON: true },
          userId: auth.user?.userId,
        }),
      );
      const promptId = writePromptAction.payload.id;
      // 这里可以添加创建Prompt后的额外操作
    } catch (error) {
      // 错误处理
      console.error("Error creating Prompt:", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <FormContainer>
        <FormTitle>{t("createPrompt")}</FormTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormField>
            <Label htmlFor="name">{t("promptName")}:</Label>
            <Input
              id="name"
              {...register("name", { required: t("promptNameRequired") })}
            />
            {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
          </FormField>

          <FormField>
            <Label htmlFor="description">{t("promptDescription")}:</Label>
            <Input id="description" {...register("description")} />
          </FormField>

          <FormField>
            <Label htmlFor="content">{t("promptContent")}:</Label>
            <TextArea
              id="content"
              {...register("content", { required: t("promptContentRequired") })}
            />
            {errors.content && (
              <ErrorMessage>{errors.content.message}</ErrorMessage>
            )}
          </FormField>

          <FormField>
            <Label htmlFor="category">{t("promptCategory")}:</Label>
            <Input id="category" {...register("category")} />
          </FormField>

          <SubmitButton type="submit">{t("createPrompt")}</SubmitButton>
        </form>
      </FormContainer>
    </ThemeProvider>
  );
};

export default withTranslations(CreatePrompt, ["ai"]);
