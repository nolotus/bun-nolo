import React from 'react';

export const WeekdayField = ({ id, register }) => (
  <div>
    <select
      id={id}
      {...register(id)}
      className="mt-1 p-2 w-full border rounded-md"
    >
      <option value="0">Sunday</option>
      <option value="1">Monday</option>
      <option value="2">Tuesday</option>
      <option value="3">Wednesday</option>
      <option value="4">Thursday</option>
      <option value="5">Friday</option>
      <option value="6">Saturday</option>
    </select>
  </div>
);
