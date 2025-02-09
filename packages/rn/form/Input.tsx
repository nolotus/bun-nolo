import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { useTheme } from "app/theme";
import { Control, Controller } from "react-hook-form";

interface InputProps extends React.ComponentProps<typeof TextInput> {
  icon?: React.ReactNode;
  error?: boolean;
  control?: Control<any>;
  name?: string;
}

export const Input = ({
  icon,
  error,
  style,
  control,
  name,
  ...props
}: InputProps) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    wrapper: {
      position: "relative",
      width: "100%",
    },
    input: {
      width: "100%",
      height: 42,
      paddingHorizontal: 12,
      paddingLeft: icon ? 42 : 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: error ? theme.error : theme.border,
      fontSize: 15,
      fontWeight: "500",
      color: theme.text,
      backgroundColor: theme.background,
      fontFamily: "-apple-system",
    },
    iconContainer: {
      position: "absolute",
      left: 12,
      top: "50%",
      transform: [{ translateY: -10 }],
      justifyContent: "center",
      alignItems: "center",
    },
    icon: {
      color: theme.textSecondary,
    },
  });

  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.wrapper}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <TextInput
              style={[styles.input, style]}
              placeholderTextColor={theme.textSecondary}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              {...props}
            />
          </View>
        )}
      />
    );
  }

  return (
    <View style={styles.wrapper}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={theme.textSecondary}
        {...props}
      />
    </View>
  );
};
