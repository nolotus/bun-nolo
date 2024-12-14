import { PersonIcon, LockIcon } from "@primer/octicons-react";
import { useAppDispatch } from "app/hooks";
import { signUp } from "auth/authSlice";
import { storeTokens } from "auth/client/token";
import { FormField } from "render/ui/Form/FormField";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod"; // Import Zod here
import { formStyles } from "render/styles/form";

// Here we define the Zod schema with translation
const schema = z.object({
  username: z.string().min(1, { message: "用户名不能为空" }),
  password: z.string().min(6, { message: "密码必须至少6个字符" }),
});

const signUpfields = [
  {
    id: "username",
    label: "username",
    type: "string",
  },
  {
    id: "password",
    label: "password",
    type: "password",
  },
];

const Signup: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema), // Use the defined schema
  });
  const onSubmit = async (user) => {
    try {
      setLoading(true);
      const locale = navigator.language;
      dispatch(signUp({ ...user, locale })).then((action) => {
        const result = action.payload;
        const { token } = result;
        if (token) {
          storeTokens(token);
          window.location.href = "/";
        }
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={formStyles.container}>
      <form onSubmit={handleSubmit(onSubmit)} style={formStyles.form}>
        <h2 style={formStyles.title}>{t("signup")}</h2>

        {signUpfields.map((field) => (
          <div key={field.id} style={formStyles.fieldWrapper}>
            <label htmlFor={field.id} style={formStyles.label}>
              {t(field.label)}
            </label>
            <FormField
              {...field}
              register={register}
              errors={errors}
              icon={
                field.id === "username" ? (
                  <PersonIcon size={20} />
                ) : (
                  <LockIcon size={20} />
                )
              }
            />
          </div>
        ))}

        {error && <p style={formStyles.error}>{error}</p>}

        <div style={formStyles.footer}>
          <button type="submit" style={formStyles.button}>
            {t("signup")}
          </button>

          <div>
            <span style={formStyles.linkText}>已有账号？</span>
            <NavLink to="/login" style={formStyles.link}>
              立即登录
            </NavLink>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Signup;
