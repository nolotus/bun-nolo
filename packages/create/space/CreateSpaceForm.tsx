import { useCallback } from "react";
import { useTheme } from "app/theme";
import { useAppDispatch } from "app/hooks";
import { useAuth } from "auth/hooks/useAuth";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Input } from "web/form/Input";
import FormTitle from "web/form/FormTitle";
import Button from "web/ui/Button";
import { PlusIcon } from "@primer/octicons-react";
import FormContainer from "web/form/FormContainer";
import { CreateSpaceRequest, SpaceVisibility } from "./types";
import { addSpace, changeSpace } from "./spaceSlice";

export const CreateSpaceForm = ({ onClose }) => {
  const { t } = useTranslation("space"); // 指定 space 命名空间
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const theme = useTheme();

  const onSubmit = useCallback(
    async (data: CreateSpaceRequest) => {
      try {
        const result = await dispatch(
          addSpace({
            name: data.name,
            description: data.description,
            visibility: data.visibility || SpaceVisibility.PRIVATE,
          })
        ).unwrap();
        dispatch(changeSpace(result.spaceId));
        toast.success(t("create_success"));
        onClose();
      } catch (error) {
        console.error("Error creating space:", error);
        toast.error(t("create_error"));
      }
    },
    [dispatch, onClose, t]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateSpaceRequest>();

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
          .form-field { margin-bottom: 20px; }
          .field-label { display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: ${theme.text}; }
          .error-message { margin-top: 6px; color: ${theme.error}; font-size: 12px; }
        `}
      </style>

      <FormContainer>
        <FormTitle>{t("create")}</FormTitle>
        <form onSubmit={handleFormSubmit}>
          <div className="form-field">
            <label className="field-label">{t("name")}</label>
            <Input
              {...register("name", {
                required: t("name_required"),
                minLength: {
                  value: 2,
                  message: t("name_min_length"),
                },
              })}
              placeholder={t("name_placeholder")}
            />
            {errors.name && (
              <div className="error-message">{errors.name.message}</div>
            )}
          </div>

          <div className="form-field">
            <label className="field-label">{t("description")}</label>
            <Input
              {...register("description")}
              placeholder={t("description_placeholder")}
            />
          </div>

          <div className="form-field">
            <label className="field-label">{t("visibility")}</label>
            <select
              {...register("visibility")}
              defaultValue={SpaceVisibility.PRIVATE}
            >
              <option value={SpaceVisibility.PRIVATE}>{t("private")}</option>
              <option value={SpaceVisibility.PUBLIC}>{t("public")}</option>
            </select>
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
            {isSubmitting ? t("submitting", { ns: "common" }) : t("create")}
          </Button>
        </form>
      </FormContainer>
    </>
  );
};
