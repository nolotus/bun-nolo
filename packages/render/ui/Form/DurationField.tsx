import React from 'react';

export const DurationField = ({ id, register }) => (
  <div>
    <input
      type="text"
      id={id}
      {...register(id)}
      placeholder="HH:MM:SS"
      className="mt-1 p-2 w-full border rounded-md"
    />
  </div>
);
