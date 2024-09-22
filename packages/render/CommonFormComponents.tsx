import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";

const useCommonFormStyles = () => {
  const theme = useAppSelector(selectTheme);
  return {
    formContainer: {
      maxWidth: "600px",
      margin: "0 auto",
      padding: "20px",
      backgroundColor: theme.surface1,
      color: theme.text1,
    },
    formTitle: {
      textAlign: "center" as const,
      color: theme.text1,
    },
    formField: {
      marginBottom: "15px",
    },
    label: {
      display: "block",
      marginBottom: "5px",
      color: theme.text2,
    },
    input: {
      width: "100%",
      padding: "8px",
      border: `1px solid ${theme.surface3}`,
      borderRadius: "4px",
      backgroundColor: theme.surface2,
      color: theme.text1,
    },
    textArea: {
      width: "100%",
      padding: "8px",
      border: `1px solid ${theme.surface3}`,
      borderRadius: "4px",
      backgroundColor: theme.surface2,
      color: theme.text1,
      minHeight: "100px",
    },
    select: {
      width: "100%",
      padding: "8px",
      border: `1px solid ${theme.surface3}`,
      borderRadius: "4px",
      backgroundColor: theme.surface2,
      color: theme.text1,
    },
    errorMessage: {
      color: theme.accentColor,
      fontSize: "0.8em",
    },
    submitButton: {
      backgroundColor: theme.accentColor,
      color: theme.surface1,
      padding: "10px 15px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    },
  };
};

export const FormContainer: React.FC = ({ children }) => {
  const styles = useCommonFormStyles();
  return <div style={styles.formContainer}>{children}</div>;
};

export const FormTitle: React.FC = ({ children }) => {
  const styles = useCommonFormStyles();
  return <h2 style={styles.formTitle}>{children}</h2>;
};

export const FormField: React.FC = ({ children }) => {
  const styles = useCommonFormStyles();
  return <div style={styles.formField}>{children}</div>;
};

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = (
  props,
) => {
  const styles = useCommonFormStyles();
  return <label {...props} style={styles.label} />;
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props,
) => {
  const styles = useCommonFormStyles();
  return <input {...props} style={styles.input} />;
};

export const TextArea: React.FC<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
> = (props) => {
  const styles = useCommonFormStyles();
  return <textarea {...props} style={styles.textArea} />;
};

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (
  props,
) => {
  const styles = useCommonFormStyles();
  return <select {...props} style={styles.select} />;
};

export const ErrorMessage: React.FC = ({ children }) => {
  const styles = useCommonFormStyles();
  return <span style={styles.errorMessage}>{children}</span>;
};

export const SubmitButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => {
  const styles = useCommonFormStyles();
  return (
    <button
      {...props}
      style={styles.submitButton}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "0.9";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1";
      }}
    />
  );
};

interface FormFieldProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  type?: string;
  required?: boolean | string;
  as?: "input" | "textarea" | "select";
  options?: { value: string; label: string }[];
}

export const FormFieldComponent: React.FC<FormFieldProps> = ({
  label,
  name,
  register,
  errors,
  type = "text",
  required = false,
  as = "input",
  options = [],
}) => {
  const styles = useCommonFormStyles();

  return (
    <FormField>
      <Label htmlFor={name}>{label}:</Label>
      {as === "input" && (
        <Input id={name} type={type} {...register(name, { required })} />
      )}
      {as === "textarea" && (
        <TextArea id={name} {...register(name, { required })} />
      )}
      {as === "select" && (
        <Select id={name} {...register(name, { required })}>
          <option value="">{`Select ${label}`}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      )}
      {errors[name] && <ErrorMessage>{errors[name].message}</ErrorMessage>}
    </FormField>
  );
};
