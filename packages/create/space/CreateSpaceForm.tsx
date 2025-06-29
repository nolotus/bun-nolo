import { useCallback } from "react";
import { useTheme } from "app/theme";
import { useAppDispatch } from "app/hooks";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Input } from "render/web/form/Input";
import FormTitle from "render/web/form/FormTitle";
import Button from "render/web/ui/Button";
import { PlusIcon } from "@primer/octicons-react";
import { SpaceVisibility } from "app/types";
import { addSpace, changeSpace, type CreateSpaceRequest } from "./spaceSlice";

const FormContainer = ({ children }) => {
  const theme = useTheme();

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: 20,
        color: theme.text,
      }}
    >
      {children}
    </div>
  );
};
export default FormContainer;
export const CreateSpaceForm = ({ onClose }) => {
  const { t } = useTranslation("space");
  const dispatch = useAppDispatch();
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

  return (
    <FormContainer>
      <FormTitle>{t("create")}</FormTitle>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: theme.space[5], // 使用主题间距系统
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: theme.space[2],
              fontSize: "14px",
              fontWeight: 500,
              color: theme.text,
            }}
          >
            {t("name")}
          </label>
          <Input
            {...register("name", {
              required: t("name_required"),
              minLength: { value: 2, message: t("name_min_length") },
            })}
            placeholder={t("name_placeholder")}
          />
          {errors.name && (
            <div
              style={{
                marginTop: theme.space[2],
                color: theme.error,
                fontSize: "12px",
              }}
            >
              {errors.name.message}
            </div>
          )}
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: theme.space[2],
              fontSize: "14px",
              fontWeight: 500,
              color: theme.text,
            }}
          >
            {t("description")}
          </label>
          <Input
            {...register("description")}
            placeholder={t("description_placeholder")}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: theme.space[2],
              fontSize: "14px",
              fontWeight: 500,
              color: theme.text,
            }}
          >
            {t("visibility")}
          </label>
          <select
            {...register("visibility")}
            defaultValue={SpaceVisibility.PRIVATE}
            style={{
              width: "100%",
              padding: theme.space[3],
              backgroundColor: theme.background,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: "6px",
              fontSize: "14px",
              transition: "border-color 0.15s ease",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = theme.primary)}
            onBlur={(e) => (e.target.style.borderColor = theme.border)}
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
  );
};
