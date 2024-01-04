// LabelsColumn.tsx
import React from "react";

const commonCellStyle = "h-6 truncate";
const dateTextColor = "text-gray-800";
const headerTextColor = "text-gray-600";
const containerClasses =
	"col-span-1 grid items-center bg-gray-100 sticky top-0 z-10 bg-white opacity-90";

const LabelsColumn: React.FC = () => {
	return (
		<div className={containerClasses}>
			<div className={`${commonCellStyle} ${dateTextColor}`}>日期:</div>
			<div className={`${commonCellStyle} ${dateTextColor}`}>时间:</div>
			<div className={`${commonCellStyle} ${headerTextColor}`}>风向:</div>
			<div className={`${commonCellStyle} ${headerTextColor}`}>浪向:</div>
			<div className={`${commonCellStyle} ${headerTextColor}`}>浪高(m):</div>
			<div className={`${commonCellStyle} ${headerTextColor}`}>周期(s):</div>
			<div className={`${commonCellStyle} ${headerTextColor}`}>风速(m/s):</div>
			<div className={`${commonCellStyle} ${headerTextColor}`}>阵风(m/s):</div>
		</div>
	);
};

export default LabelsColumn;
