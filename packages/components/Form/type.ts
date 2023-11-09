export interface FieldProps {
  id: string;
  register: UseFormRegister<any>;
  label: string;
  options?: string[];
  defaultValue?: string;
  optional?: boolean;
  readOnly?: boolean;
  icon?: React.ReactNode;
}
export interface FormFieldProps extends FieldProps {
  type:
    | 'string'
    | 'number'
    | 'password'
    | 'enum'
    | 'array'
    | 'textarea'
    | 'time'
    | 'date';
  errors: Record<string, any>;
  subtype;
  readOnly: boolean;
  className?:string;

}
