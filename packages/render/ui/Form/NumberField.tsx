import React from 'react';

import { FieldProps } from './type';

export const NumberField: React.FC<FieldProps> = ({ id, register }) => (
  <div>
    <input
      type="number"
      id={id}
      {...register(id)}
      className="w-full p-2 border rounded-lg"
      required
    />
  </div>
);
