// CommonFormComponents.tsx

import React from "react";
import styled from "styled-components";
import { UseFormRegister, FieldErrors } from "react-hook-form";

export const FormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: ${(props) => props.theme.surface1};
  color: ${(props) => props.theme.text1};
`;

export const FormTitle = styled.h2`
  text-align: center;
  color: ${(props) => props.theme.text1};
`;

export const FormField = styled.div`
  margin-bottom: 15px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  color: ${(props) => props.theme.text2};
`;

export const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid ${(props) => props.theme.surface3};
  border-radius: 4px;
  background-color: ${(props) => props.theme.surface2};
  color: ${(props) => props.theme.text1};
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid ${(props) => props.theme.surface3};
  border-radius: 4px;
  background-color: ${(props) => props.theme.surface2};
  color: ${(props) => props.theme.text1};
  min-height: 100px;
`;

export const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid ${(props) => props.theme.surface3};
  border-radius: 4px;
  background-color: ${(props) => props.theme.surface2};
  color: ${(props) => props.theme.text1};
`;

export const ErrorMessage = styled.span`
  color: ${(props) => props.theme.accentColor};
  font-size: 0.8em;
`;

export const SubmitButton = styled.button`
  background-color: ${(props) => props.theme.accentColor};
  color: ${(props) => props.theme.surface1};
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

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
}) => (
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
