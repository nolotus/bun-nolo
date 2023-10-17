interface DateFieldProps {
  id: string;
  register: any; // 用你具体使用的类型替换这个
  label: string;
  readOnly?: boolean;
}

import React from 'react';

export const DateField: React.FC<DateFieldProps> = ({
  id,
  register,
  label,
  readOnly,
}) => {
  const renderReadOnly = () => {
    return (
      <div className="p-2 border rounded-md bg-gray-100 text-gray-600 h-10 flex items-center">
        {register(id).value}
      </div>
    );
  };

  const renderInput = () => {
    return (
      <input
        type="date"
        id={id}
        {...register(id)}
        className="p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 h-10"
      />
    );
  };

  return (
    <div className="flex flex-col w-full md:w-1/2 lg:w-1/3">
      <label htmlFor={id} className="text-sm font-medium text-gray-600 mb-2">
        {label}
      </label>
      {readOnly ? renderReadOnly() : renderInput()}
    </div>
  );
};
