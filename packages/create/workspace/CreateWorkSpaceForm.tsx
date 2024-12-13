import {
  FormContainer,
  FormTitle,
  FormField,
  Label,
  ErrorMessage,
  SubmitButton,
  FormFieldComponent,
} from "render/CommonFormComponents";
import React, { useCallback } from "react";

import { useTranslation } from "react-i18next";
import { useAppDispatch } from "app/hooks";
import { useForm } from "react-hook-form";
import { useAuth } from "auth/useAuth";
import toast from "react-hot-toast";

import { addWorkspace } from "./workspaceSlice";

export const CreateWorkSpaceForm = ({ onClose }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const onSubmit = useCallback(
    async (data: any) => {
      console.log("CreateWorkSpaceForm data submitted:", data);
      try {
        const result = await dispatch(addWorkspace(data.name));
        console.log("CreateWorkSpaceForm created successfully", result);
        toast.success("add space success");
        onClose();
      } catch (error) {
        console.error("Error creating Cybot:", error);
      }
    },
    [dispatch, auth.user?.userId, onClose],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const handleFormSubmit = handleSubmit(
    (data) => {
      console.log("Form submission started");
      onSubmit(data);
    },
    (errors) => {
      console.log("Form validation failed", errors);
    },
  );
  return (
    <>
      <FormContainer>
        <FormTitle>{t("CreateSpace")}</FormTitle>
        <form onSubmit={(e) => handleFormSubmit(e)}>
          <FormFieldComponent
            label={t("spacename")}
            name="name"
            register={register}
            errors={errors}
          />
          <SubmitButton
            type="submit"
            disabled={isSubmitting}
            onClick={(e) => {
              e.preventDefault();
              console.log("Submit button clicked");
              handleFormSubmit();
            }}
          >
            {t("CreateSpace")}
          </SubmitButton>
        </form>
      </FormContainer>
    </>
  );
};
