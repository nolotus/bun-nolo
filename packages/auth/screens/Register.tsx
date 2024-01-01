import React, { useState } from "react";
import { View, StyleSheet, TextInput, Button, Alert } from "react-native";
import { hashPassword } from "core/password";
import { useRegisterMutation } from "../services";
import * as RNLocalize from "react-native-localize";
import { generateKeyPairFromSeed, verifySignedMessage } from "core/crypto";
import { generateUserId } from "core/generateMainKey";
import { parseToken, signToken } from "auth/token";
import { getLogger } from "utils/logger";
import { registerUser } from "auth/requests/registerUser";
const signupLogger = getLogger("signup");

const RegistrationScreen = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const handleRegistration = async () => {
		if (!username || !password) {
			Alert.alert("错误", "所有字段必须填写。");
			return;
		}
		const encryptionKey = await hashPassword(password);

		const deviceLanguage = RNLocalize.getLocales()[0].languageCode; // 'en', 'zh' 等
		const deviceCountry = RNLocalize.getCountry(); // 'US', 'CN' 等

		const locale = `${deviceLanguage}-${deviceCountry}`;

		const { publicKey, secretKey } = generateKeyPairFromSeed(
			username + encryptionKey + locale,
		);

		const sendData: SignupData = {
			username,
			publicKey,
			encryptedEncryptionKey: null,
			remoteRecoveryPassword: null,
			language: locale,
		};
		console.log("sendData", sendData);
		const response = await registerUser(sendData);
		console.log("response", response);

		const { encryptedData } = response;
		const decryptedData = await verifySignedMessage(
			encryptedData,
			"pqjbGua2Rp-wkh3Vip1EBV6p4ggZWtWvGyNC37kKPus",
		);

		const decryptedDataObject = JSON.parse(decryptedData);
		console.log("decryptedDataObject:", decryptedDataObject);

		const userId = generateUserId(publicKey, username, deviceLanguage);
		console.log("userId:", userId);
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
		// const result = await register({
		// 	username,
		// 	password: encryptedPassword,
		// }).unwrap();
		// if (result.success) {
		// 	Alert.alert("成功", "注册成功！");
		// 	// 这里可以加入导航代码，比如导航到登录页面
		// } else {
		// 	Alert.alert("失败", result.error);
		// }
	};

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.input}
				placeholder="请输入用户名"
				value={username}
				onChangeText={setUsername}
			/>
			<TextInput
				style={styles.input}
				placeholder="请输入密码"
				value={password}
				onChangeText={setPassword}
				secureTextEntry // 隐藏密码文字
			/>
			<Button title={"注册"} onPress={handleRegistration} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	input: {
		width: "100%",
		marginVertical: 10,
		borderWidth: 1,
		borderColor: "gray",
		padding: 10,
	},
});

export default RegistrationScreen;
