// StringToArrayInput.tsx
import React from 'react';

const StringToArrayInput = ({
  value,
  onChange,
  name,
  label,
  placeholder,
  error,
}) => {
  const handleInputChange = e => {
    const {value} = e.target;
    // 将逗号分隔的字符串转换为数组
    const valueArray = value.split(',').map(item => item.trim());
    onChange(valueArray); // 将数组传递给onChange函数
  };

  // 将数组转换为逗号分隔的字符串以在输入框中显示
  const displayValue = Array.isArray(value) ? value.join(', ') : value;

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-gray-700 text-sm font-bold mb-2 mt-4">
        {label}:
      </label>
      <input
        type="text"
        id={name}
        name={name}
        placeholder={placeholder}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        value={displayValue}
        onChange={handleInputChange}
      />
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default StringToArrayInput;
