import { Input, InputProps } from "./Input";
import { useCallback, useEffect, useState } from "react";

export interface NumberInputProps
  extends Omit<InputProps, "onChange" | "type"> {
  value?: number;
  onChange: (value: number) => void;
  decimal?: number;
}

export const NumberInput = ({
  value,
  onChange,
  decimal = 0,
  placeholder = "",
  ...props
}: NumberInputProps) => {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    if (value === undefined || value === 0) {
      setDisplayValue("");
    } else {
      const formatted =
        decimal > 0
          ? value.toFixed(decimal).replace(/\.?0+$/, "")
          : value.toString();
      setDisplayValue(formatted);
    }
  }, [value, decimal]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const pattern = new RegExp(
        `^${raw.startsWith("-") ? "-?" : ""}\\d*(\\.\\d{0,${decimal}})?$`
      );

      if (raw === "" || pattern.test(raw)) {
        setDisplayValue(raw); // 实时更新显示值
        const numericValue = parseFloat(raw) || 0;
        onChange(numericValue);
      }
    },
    [onChange, decimal]
  );

  return (
    <Input
      {...props}
      type="text"
      value={displayValue}
      onChange={handleChange}
      placeholder={value === undefined || value === 0 ? placeholder : ""}
      inputMode={decimal > 0 ? "decimal" : "numeric"}
    />
  );
};
