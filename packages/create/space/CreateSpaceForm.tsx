//common imports
import { useCallback } from "react";
import { useTheme } from "app/theme";
import { useAppDispatch } from "app/hooks";
import { useAuth } from "auth/hooks/useAuth";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

//web imports
import toast from "react-hot-toast";
import { Input } from "web/form/Input";
import FormTitle from "web/form/FormTitle";
import Button from "web/ui/Button";
import { PlusIcon } from "@primer/octicons-react";
import FormContainer from "web/form/FormContainer";

//common imports保持不变
import { CreateSpaceRequest, SpaceVisibility } from "./types"; // 添加类型导入
import { addSpace, changeSpace } from "./spaceSlice";

export const CreateSpaceForm = ({ onClose }) => {
  const { t } = useTranslation();
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
        toast.success(t("space.createSuccess"));
        onClose();
      } catch (error) {
        console.error("Error creating space:", error);
        toast.error(t("space.createError"));
      }
    },
    [dispatch, onClose, t]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateSpaceRequest>(); // 使用类型

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
        <FormTitle>{t("space.create")}</FormTitle>
        <form onSubmit={handleFormSubmit}>
          <div className="form-field">
            <label className="field-label">{t("space.name")}</label>
            <Input
              {...register("name", {
                required: t("space.nameRequired"),
                minLength: {
                  value: 2,
                  message: t("space.nameMinLength"),
                },
              })}
              placeholder={t("space.namePlaceholder")}
            />
            {errors.name && (
              <div className="error-message">{errors.name.message}</div>
            )}
          </div>

          <div className="form-field">
            <label className="field-label">{t("space.description")}</label>
            <Input
              {...register("description")}
              placeholder={t("space.descriptionPlaceholder")}
            />
          </div>

          <div className="form-field">
            <label className="field-label">{t("space.visibility")}</label>
            <select
              {...register("visibility")}
              defaultValue={SpaceVisibility.PRIVATE}
            >
              <option value={SpaceVisibility.PRIVATE}>
                {t("space.private")}
              </option>
              <option value={SpaceVisibility.PUBLIC}>
                {t("space.public")}
              </option>
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
            {isSubmitting ? t("common.submitting") : t("space.create")}
          </Button>
        </form>
      </FormContainer>
    </>
  );
};
