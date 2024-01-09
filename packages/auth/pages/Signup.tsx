import { zodResolver } from "@hookform/resolvers/zod";
import { PersonIcon, LockIcon } from "@primer/octicons-react";
import { useAppDispatch } from "app/hooks";
import { userRegister } from "auth/authSlice";
import { storeTokens } from "auth/client/token";
import { parseToken, signToken } from "auth/token";
import { createFieldsFromDSL } from "components/Form/createFieldsFromDSL";
import { FormField } from "components/Form/FormField";
import { generateKeyPairFromSeed, verifySignedMessage } from "core/crypto";
import { generateUserId } from "core/generateMainKey";
import {
	encryptWithPassword,
	generateAndSplitRecoveryPassword,
	hashPassword,
} from "core/password";
import { createZodSchemaFromDSL } from "database/schema/createZodSchemaFromDSL";
import { LifeRoutePaths } from "life/routes";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "ui";
import { getLogger } from "utils/logger";

import { useRegisterMutation } from "../services";
import { SignupData } from "../types";

const signupLogger = getLogger("signup");

const Signup: React.FC = () => {
	const [registerUser] = useRegisterMutation();
	const handleSignup = async (user, isStoreRecovery?) => {
		const { username, password: brainPassword, answer } = user;
		// Generate encryption key
		const encryptionKey = await hashPassword(brainPassword);
		// Get the user's language setting
		const language = navigator.language;

		// Generate public and private key pair based on the encryption key
		const { publicKey, secretKey } = generateKeyPairFromSeed(
			username + encryptionKey + language,
		);

		const sendData: SignupData = {
			username,
			publicKey,
			encryptedEncryptionKey: null,
			remoteRecoveryPassword: null,
			language,
		};

		if (isStoreRecovery) {
			const recoveryPassword = generateAndSplitRecoveryPassword(answer, 3);
			const [localRecoveryPassword, remoteRecoveryPassword] = recoveryPassword;

			sendData.remoteRecoveryPassword = remoteRecoveryPassword;
			sendData.encryptedEncryptionKey = encryptWithPassword(
				encryptionKey,
				recoveryPassword.join(""),
			);
		}

		const response = await registerUser(sendData).unwrap();
		const { encryptedData } = response;

		const decryptedData = await verifySignedMessage(
			encryptedData,
			"pqjbGua2Rp-wkh3Vip1EBV6p4ggZWtWvGyNC37kKPus",
		);

		const decryptedDataObject = JSON.parse(decryptedData);
		console.log("decryptedDataObject:", decryptedDataObject);

		const userId = generateUserId(publicKey, username, language);
		console.log("userId", userId);
		console.log("sendData:", userId, sendData);
		const token = signToken({ userId, username }, secretKey);

		if (
			decryptedDataObject.username === sendData.username &&
			decryptedDataObject.publicKey === sendData.publicKey &&
			decryptedDataObject.userId === userId
		) {
			signupLogger.info("Server data matches local data.");
			return { token };
		}
		signupLogger.error("Server data does not match local data.");
		throw new Error("Server data does not match local data.");
	};
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const signup = (token: string) => {
		storeTokens(token);
		const user = parseToken(token);
		dispatch(userRegister({ user, token }));
	};

	const onSubmit = async (user) => {
		try {
			setLoading(true);
			const { token } = await handleSignup(user);
			await signup(token);
			navigate(`/${LifeRoutePaths.WELCOME}`);
		} catch (error) {
			console.error(error);
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};
	const userDefinition = {
		username: { type: "string", min: 1 },
		password: { type: "password", min: 6 },
	};
	const userFormSchema = createZodSchemaFromDSL(userDefinition);
	const fields = createFieldsFromDSL(userDefinition);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(userFormSchema),
	});
	return (
		<div>
			<div className="flex items-center justify-center">
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="w-full max-w-lg p-10 bg-white rounded-lg shadow"
				>
					<h2 className="text-2xl font-bold mb-6 text-gray-800">
						{t("signup")}
					</h2>
					{fields.map((field) => (
						<div key={field.id} className="flex flex-col mb-4">
							<label
								htmlFor={field.id}
								className="block text-sm font-medium text-gray-700 mb-1"
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
						loading={loading}
						variant="primary"
						className="rounded-lg"
					>
						注册
					</Button>
				</form>
			</div>
		</div>
	);
};

export default Signup;
