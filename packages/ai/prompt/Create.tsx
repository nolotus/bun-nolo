// CreatePrompt.tsx

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "app/hooks";
import { write } from "database/dbSlice";
import { useAuth } from "auth/useAuth";
import withTranslations from "i18n/withTranslations";
import styled from "styled-components";
import { DataType } from "create/types";
import { useNavigate } from "react-router-dom";
import {
  FormContainer,
  FormTitle,
  FormFieldComponent,
  SubmitButton,
  FormField,
  Label,
  Input,
} from "render/CommonFormComponents";
import { PromptFormData } from "ai/types";

const TagInput = styled(Input)`
  margin-bottom: 5px;
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
`;

const Tag = styled.span`
  background-color: ${(props) => props.theme.surface3};
  color: ${(props) => props.theme.text2};
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.9em;
`;

const CreatePrompt: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = useAuth();

  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PromptFormData>();

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentTag.trim() !== "") {
      e.preventDefault();
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const onSubmit = async (data: PromptFormData) => {
    const promptData = { ...data, tags };
    console.log(promptData);
    try {
      const writePromptAction = await dispatch(
        write({
          data: { type: DataType.Prompt, ...promptData },
          flags: { isJSON: true },
          userId: auth.user?.userId,
        }),
      );
      const promptId = writePromptAction.payload.id;
      navigate(`/${promptId}`);
    } catch (error) {
      console.error("Error creating Prompt:", error);
    }
  };

  return (
    <FormContainer>
      <FormTitle>{t("createPrompt")}</FormTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormFieldComponent
          label={t("promptName")}
          name="name"
          register={register}
          errors={errors}
          required
        />
        <FormFieldComponent
          label={t("promptContent")}
          name="content"
          register={register}
          errors={errors}
          required
          as="textarea"
        />
        <FormFieldComponent
          label={t("category")}
          name="category"
          register={register}
          errors={errors}
        />
        <FormField>
          <Label htmlFor="tags">{t("tags")}:</Label>
          <TagInput
            id="tags"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyPress={addTag}
            placeholder={t("addTagsPlaceholder")}
          />
          <TagContainer>
            {tags.map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            ))}
          </TagContainer>
        </FormField>
        <SubmitButton type="submit">{t("createPrompt")}</SubmitButton>
      </form>
    </FormContainer>
  );
};

export default withTranslations(CreatePrompt, ["ai"]);
