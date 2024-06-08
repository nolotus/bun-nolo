import React from "react";

interface ToggleProps {
  label: string;
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onLabel?: string;
  offLabel?: string;
}

const SwitchButton: React.FC<{ checked: boolean }> = ({ checked }) => (
  <div
    className={`absolute rounded-sm bg-white transition-transform duration-200 ease-in-out ${
      checked ? "translate-x-full" : "translate-x-0"
    } left-0.5 top-0.5 h-5 w-6 group-hover:shadow-2xl`}
  />
);

const Toggle: React.FC<ToggleProps> = ({
  label,
  id,
  checked,
  onChange,
  onLabel = "On",
  offLabel = "Off",
}) => (
  // <div className="flex items-center space-x-4">
  //   <label
  //     htmlFor={id}
  //     className="group flex cursor-pointer items-center hover:text-neutral-600"
  //   >
  //     <span className="mr-3 ">{label}</span>
  //     <div
  //       className="w-13 relative h-6 "
  //       role="switch"
  //       aria-checked={checked}
  //       tabIndex={0}
  //       onKeyDown={(e) => e.key === "Enter" && onChange(!checked)}
  //     >
  //       <input
  //         type="checkbox"
  //         id={id}
  //         checked={checked}
  //         onChange={(e) => onChange(e.target.checked)}
  //         className="sr-only"
  //         aria-label={label}
  //       />
  //       <div
  //         className={`absolute inset-0 transition-colors duration-300 ease-in-out ${
  //           checked
  //             ? "bg-emerald-500"
  //             : "bg-neutral-300 group-hover:bg-neutral-400"
  //         }`}
  //       />
  //       <SwitchButton checked={checked} />
  //     </div>
  //   </label>
  //   <span className="text-base font-medium text-neutral-800">
  //     {checked ? onLabel : offLabel}
  //   </span>
  // </div>
  <label htmlFor="checkbox3" className="block w-full">
    <input id="checkbox3" name="checkbox" type="checkbox" /> {label}
  </label>
);

export default React.memo(Toggle);
