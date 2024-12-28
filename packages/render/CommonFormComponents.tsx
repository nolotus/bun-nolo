import type React from "react";
import type { ReactNode } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { FormField } from "render/form/FormField";
import { Input } from "render/form/Input";
import { Label } from "render/form/Label";
import TextArea from "render/form/TextArea";
import { defaultTheme } from "./styles/colors";
import PasswordInput from "./ui/PasswordInput";

const useCommonFormStyles = () => {
  return {
    formContainer: {
      maxWidth: "600px",
      margin: "0 auto",
      padding: "20px",
      color: defaultTheme.text,
    },
    formTitle: {
      textAlign: "center" as const,
      color: defaultTheme.text,
    },

    errorMessage: {
      color: defaultTheme.error,
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
