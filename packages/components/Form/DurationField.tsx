import React from 'react';

export const DurationField = ({id, register, label}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type="text"
      id={id}
      {...register(id)}
      placeholder="HH:MM:SS"
      className="mt-1 p-2 w-full border rounded-md"
    />
  </div>
);
