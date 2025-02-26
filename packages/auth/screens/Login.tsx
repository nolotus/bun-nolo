import { View, StyleSheet, Text } from "react-native";
import * as RNLocalize from "react-native-localize";
import { useAppDispatch } from "app/hooks";
import { signIn } from "../authSlice";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useTheme } from "app/theme";
import {
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Input } from "rn/form/Input";
import PasswordInput from "rn/form/PasswordInput";
import Button from "rn/ui/Button";

const LoginScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

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
    const { password } = data;
    const deviceLanguage = RNLocalize.getLocales()[0].languageCode;
    const deviceCountry = RNLocalize.getCountry();
    const locale = `${deviceLanguage}-${deviceCountry}`;
    const result = await dispatch(
      signIn({ ...data, locale, password })
    ).unwrap();
    if (result.token) {
      navigation.navigate("MainTabs");
      return;
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
  });

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>{t("login")}</Text>

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
              <Text style={styles.errorText}>{t("usernameRequired")}</Text>
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
              <Text style={styles.errorText}>{t("passwordRequired")}</Text>
            )}
          </View>

          <Button
            variant="primary"
            size="large"
            onPress={handleSubmit(onSubmit)}
            block
          >
            {t("login")}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;
