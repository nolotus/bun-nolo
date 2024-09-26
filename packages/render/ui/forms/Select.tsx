// components/Select.jsx
import React from "react";

const Select = ({ id, options, value, onChange, placeholder, style }) => {
  const defaultStyle = {
    display: "block",
    width: "100%",
    padding: "8px",
    fontSize: "14px",
    lineHeight: "1.5",
    color: "#333",
    backgroundColor: "#fff",
    backgroundClip: "padding-box",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    transition: "border-color .15s ease-in-out,box-shadow .15s ease-in-out",
    ...style,
  };

  return (
    <select id={id} value={value} onChange={onChange} style={defaultStyle}>
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
