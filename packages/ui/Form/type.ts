export interface FieldProps {
  id: string;
  register: UseFormRegister<any>;
  label: string;
  options?: string[];
  defaultValue?: string | null;
  optional?: boolean;
  readOnly?: boolean;
  icon?: React.ReactNode;
}
export interface FormFieldProps extends FieldProps {
  type:
    | "string"
    | "number"
    | "password"
    | "enum"
    | "array"
    | "textarea"
    | "time"
    | "date"
    | "boolean";
  errors: Record<string, any>;
  subtype;
  readOnly: boolean;
  className?: string;
}
