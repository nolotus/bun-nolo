import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "app/hooks";
import { useTheme } from "app/theme";
import { signUp } from "auth/authSlice";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import z from "zod";

import {
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable,
} from "react-native";
import { Input } from "rn/form/Input";
import PasswordInput from "rn/form/PasswordInput";
import Button from "rn/ui/Button";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import * as RNLocalize from "react-native-localize";
import { tokenManager } from "../tokenManager";
import { hashPasswordV1 } from "core/password";

const Signup = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { isLoading } = useSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const userFormSchema = z.object({
    username: z.string().nonempty({ message: t("usernameRequired") || "" }),
    password: z.string().nonempty({ message: t("passwordRequired") || "" }),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userFormSchema),
  });

  const onSubmit = async (data) => {
    try {
      const deviceLanguage = RNLocalize.getLocales()[0].languageCode;
      const deviceCountry = RNLocalize.getCountry();
      const locale = `${deviceLanguage}-${deviceCountry}`;
      const { password } = data;

      const encryptionKey = await hashPasswordV1(password);
      const action = await dispatch(signUp({ ...data, locale, encryptionKey }));
      console.log("action", action);

      if (action.payload.token) {
        console.log("action.payload.token", action.payload.token);
        await tokenManager.storeToken(action.payload.token);
        navigation.navigate("MainTabs"); // 改为与Login一致的导航目标
        return;
      }

      switch (action.payload.status) {
        case 409:
          setError(t("userExists"));
          break;
        case 400:
          setError(t("validationError"));
          break;
        case 500:
          setError(t("serverError"));
          break;
        default:
          setError(t("operationFailed"));
      }
    } catch (err) {
      setError(t("networkError"));
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      justifyContent: "center",
    },
    title: {
      fontSize: 32,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 48,
      textAlign: "center",
      letterSpacing: -0.5,
    },
    fieldGroup: {
      marginBottom: 28,
    },
    errorText: {
      fontSize: 14,
      color: theme.error,
      marginTop: 8,
    },
    footer: {
      marginTop: 32,
      gap: 32,
      alignItems: "center",
    },
    loginSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    loginText: {
      color: theme.textSecondary,
      fontSize: 15,
    },
    loginLink: {
      color: theme.primary,
      fontSize: 15,
      marginLeft: 6,
      fontWeight: "500",
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>{t("signup")}</Text>

          <View style={styles.fieldGroup}>
            <Input
              control={control}
              name="username"
              placeholder={t("enterUsername")}
              error={!!errors.username}
              icon={
                <Icon name="person" size={20} color={theme.textSecondary} />
              }
              autoComplete="username"
            />
            {errors.username && (
              <Text style={styles.errorText}>{errors.username.message}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <PasswordInput
              control={control}
              name="password"
              placeholder={t("enterPassword")}
              error={!!errors.password}
              icon={
                <Icon
                  name="lock-closed"
                  size={20}
                  color={theme.textSecondary}
                />
              }
              autoComplete="password"
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.footer}>
            <Button
              variant="primary"
              size="large"
              loading={isLoading}
              disabled={isLoading}
              onPress={handleSubmit(onSubmit)}
              block
            >
              {isLoading ? t("loading") : t("signup")}
            </Button>

            <View style={styles.loginSection}>
              <Text style={styles.loginText}>{t("haveAccount")}</Text>
              <Pressable onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>{t("loginNow")}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Signup;
