import React, { useState } from "react";
import { View, StyleSheet, TextInput, Button, Text } from "react-native";
import * as RNLocalize from "react-native-localize";
import { storeTokens } from "auth/client/token";
import { Picker } from "@react-native-picker/picker";
import { useAppDispatch } from "app/hooks";
import { signIn } from "../authSlice";

const LoginScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("argon2");

  const handleLogin = async () => {
    const deviceLanguage = RNLocalize.getLocales()[0].languageCode;
    const deviceCountry = RNLocalize.getCountry(); // 'US', 'CN' 等
    const locale = `${deviceLanguage}-${deviceCountry}`;
    const input = { username, password, locale };
    const resultAction = await dispatch(signIn(input));
    if (resultAction.payload.token) {
      storeTokens(resultAction.payload.token);
      navigation.navigate("User"); // 跳转到 AuthStack 的 Login Screen
    }
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
      <Picker
        selectedValue={selectedAlgorithm}
        style={{ height: 50, width: 150 }}
        onValueChange={(itemValue, itemIndex) =>
          setSelectedAlgorithm(itemValue)
        }
      >
        <Picker.Item label="Argon2" value="argon2" />
        <Picker.Item label="Scrypt" value="scrypt" />
      </Picker>
      <Button title="登录" onPress={handleLogin} />
    </View>
  );
};

//这里可以根据实际需要设计样式
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

export default LoginScreen;
