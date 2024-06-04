import React from "react";

export const WeekdayField = ({ id, register }) => (
  <div>
    <select
      id={id}
      {...register(id)}
      className="mt-1 w-full rounded-md border p-2"
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
