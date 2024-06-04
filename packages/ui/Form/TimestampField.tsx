import React from 'react';

export const TimestampField = ({ id, register }) => (
  <div>
    <input
      type="datetime-local"
      id={id}
      {...register(id)}
      className="mt-1 p-2 w-full border rounded-md"
    />
  </div>
);
