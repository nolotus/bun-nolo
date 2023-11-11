import React from 'react';

const Select = ({ id, options, value, onChange, placeholder }) => {
  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      className={`block w-full p-2 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
        value ? 'border-blue-300' : 'border-gray-300'
      }`}
    >
      <option value="" disabled hidden className="bg-gray-200">
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
