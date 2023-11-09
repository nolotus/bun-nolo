import React from 'react';

import { FieldProps } from './type';

export const TextAreaField: React.FC<FieldProps> = ({
  id,
  register,
  optional,
}) => (
  <div>
    <textarea
      id={id}
      {...register(id, {
        required: !optional,
      })}
      className="w-full p-2 border rounded-lg"
    />
  </div>
);
