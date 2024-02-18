// StringToArrayInput.tsx
import React from "react";

const StringToArrayInput = ({ value, onChange, name, placeholder, error }) => {
  const handleInputChange = (e) => {
    const { value } = e.target;
    // 将逗号分隔的字符串转换为数组
    const valueArray = value.split(",").map((item) => item.trim());
    onChange(valueArray); // 将数组传递给onChange函数
  };

  // 将数组转换为逗号分隔的字符串以在输入框中显示
  const displayValue = Array.isArray(value) ? value.join(", ") : value;

  return (
    <div>
      <input
        type="text"
        id={name}
        name={name}
        placeholder={placeholder}
        className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
        value={displayValue}
        onChange={handleInputChange}
      />
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default StringToArrayInput;
