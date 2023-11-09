import React from 'react';

import { FieldProps } from './type';

export const TextField: React.FC<FieldProps> = ({
  id,
  register,
  optional,
  readOnly,
  defaultValue,
  icon,
}) => (
  <div className="relative">
    {icon && (
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon}
      </div>
    )}
    <input
      type="text"
      id={id}
      {...register(id, {
        required: !optional,
      })}
      className={`w-full p-2 border rounded-lg ${icon ? 'pl-10' : 'pl-2'}`}
      readOnly={readOnly}
      defaultValue={defaultValue}
    />
  </div>
);
