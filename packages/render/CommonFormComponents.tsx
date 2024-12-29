import type React from "react";
import type { ReactNode } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { FormField } from "render/form/FormField";
import { Input } from "web/form/Input";
import { Label } from "web/form/Label";
import TextArea from "web/form/TextArea";
import PasswordInput from "./ui/PasswordInput";
import { useTheme } from "app/theme";

const useCommonFormStyles = () => {
  const theme = useTheme();

  return {
    formContainer: {
      maxWidth: "600px",
      margin: "0 auto",
      padding: "20px",
      color: theme.text,
    },
    formTitle: {
      textAlign: "center" as const,
      color: theme.text,
    },
    errorMessage: {
      color: theme.error,
      fontSize: "0.8em",
    },
  };
};

interface FormContainerProps {
  children: ReactNode;
}

export const FormContainer: React.FC<FormContainerProps> = ({ children }) => {
  const styles = useCommonFormStyles();
  return <div style={styles.formContainer}>{children}</div>;
};

export const FormTitle: React.FC<{ children: ReactNode }> = ({ children }) => {
  const styles = useCommonFormStyles();
  return <h2 style={styles.formTitle}>{children}</h2>;
};

export const ErrorMessage: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const styles = useCommonFormStyles();
  return <span style={styles.errorMessage}>{children}</span>;
};

interface FormFieldComponentProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  type?: string;
  required?: boolean | string;
  as?: "input" | "textarea" | "select";
  options?: { value: string; label: string }[];
}

export const FormFieldComponent: React.FC<FormFieldComponentProps> = ({
  label,
  name,
  register,
  errors,
  type = "text",
  required = false,
  as = "input",
}) => {

  const renderField = () => {
    const inputProps = {
      id: name,
      ...register(name, { required }),
      error: !!errors[name],
    };

    switch (as) {
      case "textarea":
        return <TextArea {...inputProps} />;
      default:
        const InputComponent = type === "password" ? PasswordInput : Input;
        return <InputComponent {...inputProps} type={type} />;
    }
  };

  return (
    <FormField>
      <Label htmlFor={name}>{label}:</Label>
      {renderField()}
      {errors[name] && <ErrorMessage>{errors[name].message}</ErrorMessage>}
    </FormField>
  );
};
