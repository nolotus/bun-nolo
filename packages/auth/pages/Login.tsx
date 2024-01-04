import { zodResolver } from "@hookform/resolvers/zod";
import { PersonIcon, LockIcon } from "@primer/octicons-react";
import { storeTokens } from "auth/client/token";
import { useLoginMutation } from "auth/services";
import { signToken } from "auth/token";
import { createFieldsFromDSL } from "components/Form/createFieldsFromDSL";
import { FormField } from "components/Form/FormField";
import { generateKeyPairFromSeed } from "core/crypto";
import { generateUserId } from "core/generateMainKey";
import { hashPassword } from "core/password";
import { LifeRoutePaths } from "life/routes";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "ui";

import { userFormSchema } from "../schema";

const formDSL = {
	username: {
		type: "string",
		min: 1,
	},
	password: {
		type: "password",
		min: 6,
	},
};
const fields = createFieldsFromDSL(formDSL);

const Login: React.FC = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [error, setError] = useState(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(userFormSchema),
	});

	// const onChange = (name: string, values: string) => {
	//   console.log('value', name, values);
	//   const willSaveData = `${name}:${values}`;
	//   change('3-myNoloConfig', willSaveData);
	// };

	const [login, { isLoading }] = useLoginMutation();
	const onSubmit = async (input) => {
		try {
			// await login(user);
			const { username, password } = input;
			const language = navigator.language;
			const encryptionKey = await hashPassword(password);

			const { publicKey, secretKey } = generateKeyPairFromSeed(
				username + encryptionKey + language,
			);
			const userId = generateUserId(publicKey, username, language);

			const token = signToken({ userId, publicKey, username }, secretKey);
			const { token: newToken } = await login({ userId, token }).unwrap();
			storeTokens(newToken);
			navigate(`/${LifeRoutePaths.WELCOME}`);
		} catch (noloError) {
			console.error(noloError);

			let message;
			switch (noloError.message) {
				case "404":
					message = t("errors.userNotFound");
					break;
				case "403":
					message = t("errors.invalidCredentials");
					break;
				case "400":
					message = t("errors.validationError");
					break;
				case "500":
				default:
					message = t("errors.serverError");
					break;
			}

			setError(message);
		}
	};
	return (
		<div>
			<div className="flex items-center justify-center">
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="w-full max-w-lg p-10 bg-white rounded-lg shadow"
				>
					<h2 className="text-2xl font-bold mb-6 text-gray-800">
						{t("login")}
					</h2>
					{fields.map((field) => (
						<div key={field.id} className="mb-6">
							<label
								htmlFor={field.id}
								className="block mb-2 text-sm font-medium text-gray-700"
							>
								{t(field.label)}
							</label>
							<FormField
								{...field}
								register={register}
								errors={errors}
								icon={
									field.id === "username" ? (
										<PersonIcon className="text-gray-400" size={24} />
									) : (
										<LockIcon className="text-gray-400" size={24} />
									)
								}
							/>
						</div>
					))}
					{error && <p className="text-red-500 text-sm mt-2 mb-2">{error}</p>}
					<Button
						type="submit"
						variant="primary"
						size="medium"
						width="w-full" // 通过 props 传递宽度类
						loading={isLoading} // 假设你有一个状态来表示加载状态
					>
						{t("submit")}
					</Button>
				</form>
			</div>
		</div>
	);
};

export default Login;
