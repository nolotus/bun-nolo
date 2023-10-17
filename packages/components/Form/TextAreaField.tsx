import React from 'react';
import {FieldProps} from './type';

export const TextAreaField: React.FC<FieldProps> = ({
  id,
  register,
  label,
  optional,
}) => (
  <div>
    <label htmlFor={id} className="block font-medium mb-1">
      {label}
    </label>
    <textarea
      id={id}
      {...register(id, {
        required: !optional,
      })}
      className="w-full p-2 border rounded-lg"
    />
  </div>
);
