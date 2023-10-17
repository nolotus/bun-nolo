import React from 'react';
import {FieldProps} from './type';

export const ArrayField: React.FC<FieldProps> = ({
  id,
  register,
  label,
  options,
}) => (
  <div>
    <label htmlFor={id} className="block font-medium mb-1">
      {label}
    </label>
    {options &&
      options.map((option, index) => (
        <label key={index} className="block">
          <input type="checkbox" name={id} value={option} {...register(id)} />
          {option}
        </label>
      ))}
  </div>
);
