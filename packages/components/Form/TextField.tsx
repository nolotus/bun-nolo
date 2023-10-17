import React from 'react';
import {FieldProps} from './type';

export const TextField: React.FC<FieldProps> = ({
  id,
  register,
  label,
  optional,
  readOnly,
  defaultValue,
}) => (
  <div>
    <label htmlFor={id} className="block font-medium mb-1">
      {label}
    </label>
    <input
      type="text"
      id={id}
      {...register(id, {
        required: !optional,
      })}
      className="w-full p-2 border rounded-lg"
      readOnly={readOnly}
      defaultValue={defaultValue}
    />
  </div>
);
