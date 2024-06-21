// LabelsColumn.tsx
import React from "react";

const commonCellStyle = "h-6 truncate";
const containerClasses = "col-span-1 grid items-center sticky top-0 z-10 ";

const LabelsColumn: React.FC = () => {
  return (
    <div className={containerClasses}>
      <div className={`${commonCellStyle} `}>日期:</div>
      <div className={`${commonCellStyle} `}>时间:</div>
      <div className={commonCellStyle}>风向:</div>
      <div className={commonCellStyle}>浪向:</div>
      <div className={commonCellStyle}>浪高(m):</div>
      <div className={commonCellStyle}>周期(s):</div>
      <div className={commonCellStyle}>风速(m/s):</div>
      <div className={commonCellStyle}>阵风(m/s):</div>
      <div className={commonCellStyle}>气温(℃):</div>
    </div>
  );
};

export default LabelsColumn;
