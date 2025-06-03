import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";

interface RadioOption {
  id: string;
  value: string;
  label: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  name?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  name = "radio-group",
  onChange,
  className = "",
}) => {
  const theme = useSelector(selectTheme);

  const handleChange = (newValue: string) => {
    onChange?.(newValue);
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "column",
    gap: theme.space[2],
  };

  const labelStyle: React.CSSProperties = {
    display: "flex",
    cursor: "pointer",
    fontWeight: "500",
    position: "relative",
    overflow: "hidden",
    marginBottom: theme.space[2],
  };

  const inputStyle: React.CSSProperties = {
    position: "absolute",
    left: "-9999px",
  };

  const getSpanStyle = (isSelected: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    padding: `${theme.space[2]} ${theme.space[4]} ${theme.space[2]} ${theme.space[2]}`,
    borderRadius: "99em",
    transition: "0.25s ease",
    backgroundColor: isSelected
      ? `color-mix(in srgb, #fff 84%, ${theme.primary})`
      : "transparent",
    position: "relative",
    ":hover": {
      backgroundColor: `color-mix(in srgb, #fff 84%, ${theme.primary})`,
    },
  });

  const getCircleStyle = (isSelected: boolean): React.CSSProperties => ({
    display: "flex",
    flexShrink: 0,
    content: '""',
    backgroundColor: "#fff",
    width: "1.5em",
    height: "1.5em",
    borderRadius: "50%",
    marginRight: theme.space[2],
    transition: "0.25s ease",
    boxShadow: isSelected
      ? `inset 0 0 0 0.4375em ${theme.primary}`
      : `inset 0 0 0 0.125em ${theme.primary}`,
  });

  return (
    <div className={className} style={containerStyle}>
      {options.map((option) => {
        const isSelected = value === option.value;
        const [isHovered, setIsHovered] = useState(false);

        return (
          <label
            key={option.id}
            style={labelStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={isSelected}
              onChange={() => handleChange(option.value)}
              style={inputStyle}
            />
            <span
              style={{
                ...getSpanStyle(isSelected),
                backgroundColor:
                  isSelected || isHovered
                    ? `color-mix(in srgb, #fff 84%, ${theme.primary})`
                    : "transparent",
              }}
            >
              <div style={getCircleStyle(isSelected)} />
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
};

export default RadioGroup;
