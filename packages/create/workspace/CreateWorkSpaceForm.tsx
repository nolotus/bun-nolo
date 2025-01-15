//common imports
import { useCallback } from "react";
import { useTheme } from "app/theme";
import { useAppDispatch } from "app/hooks";
import { useAuth } from "auth/useAuth";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

//web imports
import toast from "react-hot-toast";
import { Input } from "web/form/Input";
import FormTitle from "web/form/FormTitle";
import Button from "web/ui/Button";
import { PlusIcon } from "@primer/octicons-react";
import FormContainer from "web/form/FormContainer";

import { addWorkspace } from "./workspaceSlice";

export const CreateWorkSpaceForm = ({ onClose }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const theme = useTheme();

  const onSubmit = useCallback(
    async (data: any) => {
      console.log("CreateWorkSpaceForm data submitted:", data);
      try {
        const result = await dispatch(addWorkspace(data.name));
        console.log("CreateWorkSpaceForm created successfully", result);
        toast.success("add space success");
        onClose();
      } catch (error) {
        console.error("Error creating ", error);
      }
    },
    [dispatch, auth.user?.userId, onClose]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const handleFormSubmit = handleSubmit(
    (data) => {
      console.log("Form submission started");
      onSubmit(data);
    },
    (errors) => {
      console.log("Form validation failed", errors);
    }
  );

  return (
    <>
      <style>
        {`
          .form-field {
            margin-bottom: 20px;
          }
          
          .field-label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 500;
            color: ${theme.text};
          }

          .error-message {
            margin-top: 6px;
            color: ${theme.error};
            font-size: 12px;
          }
        `}
      </style>

      <FormContainer>
        <FormTitle>{t("CreateSpace")}</FormTitle>
        <form onSubmit={handleFormSubmit}>
          <div className="form-field">
            <label className="field-label">{t("spacename")}</label>
            <Input
              {...register("name", {
                required: "Space name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
              placeholder={t("Enter space name")}
            />
            {errors.name && (
              <div className="error-message">{errors.name.message}</div>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            block
            size="large"
            loading={isSubmitting}
            disabled={isSubmitting}
            icon={<PlusIcon />}
          >
            {isSubmitting ? t("submiting") : t("CreateSpace")}
          </Button>
        </form>
      </FormContainer>
    </>
  );
};
