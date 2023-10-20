import React from "react";

const SelectBox = ({ options, value, handleChange, placeholder }) => {
  return (
    <select
      value={value}
      onChange={handleChange}
      className={`border ${
        value ? "border-blue-300" : "border-gray-300"
      } p-2 rounded w-full bg-white`}
    >
      <option value="" disabled className="bg-gray-200">
        {placeholder}
      </option>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export default SelectBox;
