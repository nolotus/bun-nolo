import { zodResolver } from "@hookform/resolvers/zod";
import { LockIcon, PersonIcon } from "@primer/octicons-react";
import { useAppDispatch } from "app/hooks";
import { useTheme } from "app/theme";
import { signUp } from "auth/authSlice";
import { storeTokens } from "auth/client/token";
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { FormField } from "web/form/FormField";
import Button from "web/ui/Button";
import * as z from "zod";

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
	const theme = useTheme();
	const dispatch = useAppDispatch();
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(schema),
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
		<>
			<style>
				{`
          .signup-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: calc(100dvh - 60px);
            padding: 20px;
          }
          
          .signup-form {
            width: 100%;
            max-width: 380px;
          }
          
          .signup-title {
            font-size: 28px;
            font-weight: 600;
            color: ${theme.text};
            margin-bottom: 36px;
            text-align: center;
          }
          
          .field-wrapper {
            margin-bottom: 20px;
          }
          
          .field-label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            color: ${theme.textSecondary};
            font-weight: 500;
          }
          
          .error-message {
            margin-top: 8px;
            margin-bottom: 8px;
            color: ${theme.error};
            font-size: 14px;
          }
          
          .form-footer {
            margin-top: 32px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            align-items: center;
          }
          
          .link-text {
            color: ${theme.textSecondary};
            font-size: 14px;
          }
          
          .login-link {
            color: ${theme.primary};
            text-decoration: none;
            font-size: 14px;
            margin-left: 4px;
          }
          
          .login-link:hover {
            color: ${theme.primaryLight};
          }

          .button-container {
            width: 100%;
          }
        `}
			</style>

			<div className="signup-container">
				<form onSubmit={handleSubmit(onSubmit)} className="signup-form">
					<h2 className="signup-title">{t("signup")}</h2>

					{signUpfields.map((field) => (
						<div key={field.id} className="field-wrapper">
							<label htmlFor={field.id} className="field-label">
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

					{error && <p className="error-message">{error}</p>}

					<div className="form-footer">
						<div className="button-container">
							<Button
								variant="primary"
								size="large"
								loading={loading}
								disabled={loading}
								onClick={handleSubmit(onSubmit)}
								block
							>
								{loading ? t("loading") : t("signup")}
							</Button>
						</div>

						<div>
							<span className="link-text">已有账号？</span>
							<NavLink to="/login" className="login-link">
								立即登录
							</NavLink>
						</div>
					</div>
				</form>
			</div>
		</>
	);
};

export default Signup;
