import React, { useState, useRef, useEffect } from "react";

interface DropDownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

const DropDown: React.FC<DropDownProps> = ({ trigger, children }) => {
  const node = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleClickOutside = (e: MouseEvent) => {
    if (node.current?.contains(e.target as Node)) {
      // inside click
      return;
    }
    // outside click
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      // add when mounted
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      // return function to be called when unmounted
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={node}>
      <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
        {trigger}
      </button>
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none transition duration-200 ease-in-out transform scale-95">
          <div className="py-1">{children}</div>
        </div>
      )}
    </div>
  );
};

export default DropDown;
