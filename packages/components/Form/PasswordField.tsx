import React from 'react';

import { FieldProps } from './type';

export const PasswordField: React.FC<FieldProps> = ({ id, register, icon }) => (
  <div className="relative">
    {icon && (
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon}
      </div>
    )}
    <input
      type="password"
      id={id}
      {...register(id)}
      className={`w-full p-2 border rounded-lg ${icon ? 'pl-10' : 'pl-2'}`}
      required
    />
  </div>
);
