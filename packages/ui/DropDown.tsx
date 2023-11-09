import React, { useState, useRef, useEffect } from "react";

interface DropDownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

const DropDown: React.FC<DropDownProps> = ({ trigger, children }) => {
  const node = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleClickOutside = (e: MouseEvent) => {
    if (!node.current || node.current.contains(e.target as Node)) {
      return;
    }
    setIsOpen(false);
  };

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    // Event listeners are added when the dropdown is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }
    
    // Clean up event listeners
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={node}>
      <button onClick={() => setIsOpen(prev => !prev)} className="focus:outline-none">
        {trigger}
      </button>
      {isOpen && (
        <div 
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none transition duration-200 ease-in-out"
          style={{ transform: 'scale(1)', opacity: 1 }}
        >
          <div className="py-1">{children}</div>
        </div>
      )}
    </div>
  );
};

export default DropDown;
