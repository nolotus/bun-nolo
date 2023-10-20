import React from "react";

interface ToggleProps {
  label: string;
  id: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, id, checked, onChange }) => (
  <div className="flex items-center">
    <label htmlFor={id} className="mr-2">
      {label}
    </label>
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      className="cursor-pointer"
    />
  </div>
);

export default Toggle;
