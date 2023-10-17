import React from 'react';
import {FieldProps} from './type';

export const PasswordField: React.FC<FieldProps> = ({id, register, label}) => (
  <div>
    <label htmlFor={id} className="block font-medium mb-1">
      {label}
    </label>
    <input
      type="password"
      id={id}
      {...register(id)}
      className="w-full p-2 border rounded-lg"
      required
    />
  </div>
);
