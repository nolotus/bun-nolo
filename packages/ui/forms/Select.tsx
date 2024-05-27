import React from "react";

const Select = ({ id, options, value, onChange, placeholder }) => {
  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      className={`block w-full  p-2`}
    >
      <option value="" disabled hidden>
        {placeholder}
      </option>
      {options.map((option, index) => (
        <option key={option.value || index} value={option.value || option}>
          {option.label || option}
        </option>
      ))}
    </select>
  );
};

export default Select;
