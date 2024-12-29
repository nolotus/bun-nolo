// components/auth/Login.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { LockIcon, PersonIcon } from "@primer/octicons-react";
import { useAppDispatch } from "app/hooks";
import { useTheme } from "app/theme";
import { storeTokens } from "auth/client/token";
import { hashPassword } from "core/password";
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { signIn } from "../authSlice";
import { signInFields, userFormSchema } from "../schema";
import { FormField } from "web/form/FormField";
import Button from "web/ui/Button";

const Login: React.FC = () => {
	const theme = useTheme();
	const { isLoading } = useSelector((state) => state.auth);
	const dispatch = useAppDispatch();
	const { t } = useTranslation();
	const [error, setError] = useState<string | null>(null);

	const loginStyles = `
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100dvh - 60px);
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen;
    }
    
    .login-form {
      width: 100%;
      max-width: 380px;
    }
    
    .login-title {
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
    
    .signup-link {
      color: ${theme.primary};
      text-decoration: none;
      font-size: 14px;
      margin-left: 4px;
      transition: color 0.2s;
    }
    
    .signup-link:hover {
      color: ${theme.primaryLight};
    }

    .remember-forgot {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      margin-top: 12px;
    }

    .remember-me {
      display: flex;
      align-items: center;
      gap: 8px;
      color: ${theme.textSecondary};
      font-size: 14px;
    }

    .forgot-password {
      color: ${theme.primary};
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
    }

    .forgot-password:hover {
      color: ${theme.primaryLight};
    }

    .button-container {
      width: 100%;
    }
  `;

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(userFormSchema),
	});

	const onSubmit = async (data) => {
		try {
			const locale = navigator.language;
			const { password } = data;
			const encryptionKey = await hashPassword(password);
			const action = await dispatch(signIn({ ...data, locale, encryptionKey }));

			if (action.payload.token) {
				storeTokens(action.payload.token);
				window.location.href = "/";
				return;
			}

			// 处理错误情况
			switch (action.payload.status) {
				case 404:
					setError(t("errors:userNotFound"));
					break;
				case 403:
					setError(t("errors:invalidCredentials"));
					break;
				case 401:
					setError(t("errors:notAuthorized"));
					break;
				case 429:
					setError(t("errors:tooManyAttempts"));
					break;
				case 400:
					setError(t("errors:validationError"));
					break;
				case 500:
					setError(t("errors:serverError"));
					break;
				default:
					setError(t("errors:operationFailed"));
			}
		} catch (err) {
			setError(t("errors:networkError"));
		}
	};

	return (
		<div className="login-container">
			<style>{loginStyles}</style>
			<form onSubmit={handleSubmit(onSubmit)} className="login-form">
				<h2 className="login-title">{t("login")}</h2>

				{signInFields.map((field) => (
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

				<div className="remember-forgot">
					<label className="remember-me">
						<input type="checkbox" {...register("rememberMe")} />
						{t("rememberMe")}
					</label>
					<NavLink to="/forgot-password" className="forgot-password">
						{t("forgotPassword")}
					</NavLink>
				</div>

				{error && <p className="error-message">{error}</p>}

				<div className="form-footer">
					<div className="button-container">
						<Button
							variant="primary"
							size="large"
							loading={isLoading}
							disabled={isLoading}
							onClick={handleSubmit(onSubmit)}
							style={{ width: '100%' }}
						>
							{isLoading ? t("loading") : t("login")}
						</Button>
					</div>

					<div>
						<span className="link-text">{t("noAccount")}</span>
						<NavLink to="/signup" className="signup-link">
							{t("signUpNow")}
						</NavLink>
					</div>
				</div>
			</form>
		</div>
	);
};

export default Login;
