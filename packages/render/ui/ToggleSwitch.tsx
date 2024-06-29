import React, { useState, useEffect } from "react";

interface ToggleSwitchProps {
  disabled?: boolean;
  loading?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  disabled = false,
  loading = false,
  checked,
  defaultChecked = false,
  onChange,
  ariaLabelledby,
  ariaDescribedby,
  value,
}) => {
  const [isChecked, setIsChecked] = useState<boolean>(value, defaultChecked);

  useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked);
    }
  }, [checked]);

  const handleToggle = () => {
    if (!loading && !disabled) {
      const newChecked = !isChecked;
      setIsChecked(newChecked);
      if (onChange) {
        onChange(newChecked);
      }
    }
  };

  const toggleStyle = {
    userSelect: "none" as "none",
    transition: "0.2s ease",
    display: "inline-block" as "inline-block",
    height: "30px",
    width: "51px",
    position: "relative" as "relative",
    boxShadow: `inset 0 0 0px 2px ${disabled ? "#ccc" : "#e4e4e4"}`,
    borderRadius: "60px",
    opacity: disabled ? 0.5 : 1,
    cursor: disabled
      ? ("not-allowed" as "not-allowed")
      : ("pointer" as "pointer"),
    pointerEvents: loading ? ("none" as "none") : undefined,
  };

  const beforeStyle = {
    content: '""' as '""',
    position: "absolute" as "absolute",
    display: "block" as "block",
    height: "30px",
    width: isChecked ? "51px" : "30px",
    top: "0",
    left: "0",
    borderRadius: "15px",
    background: isChecked ? "rgba(76, 217, 100, 1)" : "rgba(76, 217, 100, 0)",
    transition: "0.2s cubic-bezier(.24,0,.5,1)",
  };

  const afterStyle = {
    content: '""' as '""',
    position: "absolute" as "absolute",
    display: "block" as "block",
    height: "28px",
    width: "28px",
    top: "50%",
    marginTop: "-14px",
    left: isChecked ? "22px" : "1px",
    borderRadius: "60px",
    background: "#fff",
    boxShadow:
      "0 0 0 1px hsla(0, 0%, 0%, 0.1), 0 4px 0px 0 hsla(0, 0%, 0%, 0.04), 0 4px 9px hsla(0, 0%, 0%, 0.13), 0 3px 3px hsla(0, 0%, 0%, 0.05)",
    transition: "0.35s cubic-bezier(.54,1.60,.5,1)",
    opacity: loading ? 0.6 : 1,
  };

  return (
    <label aria-labelledby={ariaLabelledby} aria-describedby={ariaDescribedby}>
      <input
        type="checkbox"
        style={{ opacity: 0, position: "absolute", left: "-9999px" }}
        checked={isChecked}
        onChange={handleToggle}
        disabled={disabled || loading}
      />
      <div style={toggleStyle}>
        <span style={beforeStyle}></span>
        {!loading ? (
          <span style={afterStyle}></span>
        ) : (
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "gray",
            }}
          >
            Loading...
          </span>
        )}
      </div>
    </label>
  );
};

export default ToggleSwitch;
