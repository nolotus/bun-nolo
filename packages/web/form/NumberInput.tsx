// web/form/NumberInput.tsx
import { Input, InputProps } from "./Input"; // 直接引入基础组件
import { useCallback, useEffect, useState } from "react";

export interface NumberInputProps
  extends Omit<InputProps, "onChange" | "type"> {
  value: number; // 强制类型约束为数值
  onChange: (value: number) => void; // 直接传递Number类型
  decimal?: number; // 控制小数精度（默认整数）
}

export const NumberInput = ({
  value, // 外部传入的数值状态
  onChange,
  decimal = 0,
  placeholder = "",
  ...props
}: NumberInputProps) => {
  const [displayValue, setDisplayValue] = useState("");

  // 同步外部数值变化（关键处理逻辑）
  useEffect(() => {
    if (value === 0) {
      setDisplayValue("");
    } else {
      // 根据精度处理小数点
      const formatted =
        decimal > 0
          ? value.toFixed(decimal).replace(/\.?0+$/, "") // 移除末尾无效零
          : value.toString();
      setDisplayValue(formatted);
    }
  }, [value, decimal]);

  // 用户输入处理逻辑
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      // 输入验证正则（支持负号可选）
      const pattern = new RegExp(
        `^${raw.startsWith("-") ? "-?" : ""}\\d*(\\.\\d{0,${decimal}})?$`
      );

      if (raw === "" || pattern.test(raw)) {
        // 转换为数值时处理边界条件
        const numericValue = parseFloat(raw) || 0;
        onChange(numericValue);
      }
    },
    [onChange, decimal]
  );

  return (
    <Input
      {...props}
      type="text" // 强制覆盖类型
      value={displayValue}
      onChange={handleChange}
      placeholder={value === 0 ? placeholder : ""} // 零值时显示提示
      inputMode={decimal > 0 ? "decimal" : "numeric"}
    />
  );
};
