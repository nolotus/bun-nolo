import React, { useState } from "react";
import { View, StyleSheet, TextInput, Button, Text, Alert } from "react-native";
import * as RNLocalize from "react-native-localize";
import { storeTokens } from "auth/client/token";
import { useAppDispatch } from "app/hooks";
import { signIn } from "../authSlice";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
// import argon2 from "@sphereon/react-native-argon2";
import { SALT } from "core/config";
// const hashPassword = async (password: string) => {
//   console.log("argon2", argon2);
//   const result = await argon2(password, SALT, {
//     hashLength: 32,
//     memory: 1024,
//     parallelism: 1,
//     mode: "argon2id",
//     iterations: 1,
//   });
//   console.log("result", result);
//   // return hashedPassword.encoded;
// };
const LoginScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  // const dispatch = useAppDispatch();
  // const [username, setUsername] = useState("");
  // const [password, setPassword] = useState("");
  // const [selectedAlgorithm, setSelectedAlgorithm] = useState("argon2");
  // const handleLogin = async () => {

  //   const input = { username, password, locale };
  //   const resultAction = await dispatch(signIn(input));
  //   if (resultAction.payload.token) {
  //     storeTokens(resultAction.payload.token);
  //     navigation.navigate("User"); // 跳转到 AuthStack 的 Login Screen
  //   }
  // };
  // return (
  //   <View style={styles.container}>

  //     <TextInput
  //       style={styles.input}
  //       placeholder="请输入密码"
  //       value={password}
  //       onChangeText={setPassword}
  //       secureTextEntry // 隐藏密码文字
  //     />
  //     <Picker
  //       selectedValue={selectedAlgorithm}
  //       style={{ height: 50, width: 150 }}
  //       onValueChange={(itemValue, itemIndex) =>
  //         setSelectedAlgorithm(itemValue)
  //       }
  //     >
  //       <Picker.Item label="Argon2" value="argon2" />
  //       <Picker.Item label="Scrypt" value="scrypt" />
  //     </Picker>
  //     <Button title="登录" onPress={handleLogin} />
  //   </View>
  // );
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const onSubmit = async (data) => {
    console.log(data);
    // const { t } = useTranslation();

    const deviceLanguage = RNLocalize.getLocales()[0].languageCode;
    const deviceCountry = RNLocalize.getCountry(); // 'US', 'CN' 等
    const locale = `${deviceLanguage}-${deviceCountry}`;
    const { password } = data;
    // const encryptionKey = await hashPassword(password);

    dispatch(signIn({ ...data, locale }))
      .then(() => {
        navigation.navigate("User"); // 跳转到 AuthStack 的 Login Screen
      })
      .catch((error) => {
        // let message;
        // switch (noloError.message) {
        //   case "404":
        //     message = t("errors.userNotFound");
        //     break;
        //   case "403":
        //     message = t("errors.invalidCredentials");
        //     break;
        //   case "400":
        //     message = t("errors.validationError");
        //     break;
        //   case "500":
        //   default:
        //     message = t("errors.serverError");
        //     break;
        // }
        // setError(message);
      });
  };
  return (
    <View style={styles.container}>
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="请输入用户名"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
        name="username"
      />
      {errors.username && <Text>This is required.</Text>}

      <Controller
        control={control}
        rules={{
          maxLength: 100,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="请输入密码"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            secureTextEntry // 隐藏密码文字
          />
        )}
        name="password"
      />

      <Button title="Submit" onPress={handleSubmit(onSubmit)} />
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
    padding: 10,
  },
});

export default LoginScreen;
