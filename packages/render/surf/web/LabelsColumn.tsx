// LabelsColumn.tsx
import React from "react";
import clsx from "clsx";

type LabelsColumnProps = {
	stickyCellStyle: string;
	dateCellStyle: string;
	headerCellStyle: string;
};

const LabelsColumn: React.FC<LabelsColumnProps> = ({
	stickyCellStyle,
	dateCellStyle,
	headerCellStyle,
}) => {
	return (
		<div
			className={clsx(
				"col-span-1",
				stickyCellStyle,
				"grid items-center",
				"bg-gray-100",
			)}
		>
			<div className={dateCellStyle}>日期:</div>
			<div className={dateCellStyle}>时间:</div>
			<div className={headerCellStyle}>风向:</div>
			<div className={headerCellStyle}>浪向:</div>
			<div className={headerCellStyle}>浪高(m):</div>
			<div className={headerCellStyle}>周期(s):</div>
			<div className={headerCellStyle}>风速(m/s):</div>
			<div className={headerCellStyle}>阵风(m/s):</div>
		</div>
	);
};

export default LabelsColumn;
