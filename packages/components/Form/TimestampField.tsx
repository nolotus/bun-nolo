import React from 'react';

export const TimestampField = ({id, register, label}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type="datetime-local"
      id={id}
      {...register(id)}
      className="mt-1 p-2 w-full border rounded-md"
    />
  </div>
);
