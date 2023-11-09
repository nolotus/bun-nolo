import React from 'react';

import { FieldProps } from './type';

export const ArrayField: React.FC<FieldProps> = ({ id, register, options }) => (
  <div>
    {options &&
      options.map((option, index) => (
        <label key={index} className="block">
          <input type="checkbox" name={id} value={option} {...register(id)} />
          {option}
        </label>
      ))}
  </div>
);
