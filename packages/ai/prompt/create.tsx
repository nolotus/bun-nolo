import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "app/hooks";
import { write } from "database/dbSlice";
import { useAuth } from "auth/useAuth";
import withTranslations from "i18n/withTranslations";
import styled from "styled-components";
import { DataType } from "create/types";

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

const TagInput = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid ${(props) => props.theme.surface3};
  border-radius: 4px;
  background-color: ${(props) => props.theme.surface2};
  color: ${(props) => props.theme.text1};
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
  const dispatch = useAppDispatch();
  const auth = useAuth();

  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentTag.trim() !== "") {
      e.preventDefault();
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const onSubmit = async (data: any) => {
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
      // 这里可以添加创建Prompt后的额外操作
    } catch (error) {
      // 错误处理
      console.error("Error creating Prompt:", error);
    }
  };

  return (
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
          <Label htmlFor="category">{t("category")}:</Label>
          <Input id="category" {...register("category")} />
        </FormField>

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
