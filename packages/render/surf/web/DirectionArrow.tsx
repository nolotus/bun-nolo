// DirectionArrow.tsx
import React from "react";
import { ArrowDownIcon } from "@primer/octicons-react";

type DirectionArrowProps = {
	rotationValue: string;
};

const DirectionArrow: React.FC<DirectionArrowProps> = ({ rotationValue }) => {
	// 定义并提取className
	const iconContainerClasses = "text-gray-500 text-center h-6";
	const iconWrapperClasses = "inline-flex items-center justify-center";

	return (
		<div className={iconContainerClasses}>
			<div
				className={iconWrapperClasses}
				style={{ transform: `rotate(${rotationValue}deg)` }}
			>
				<ArrowDownIcon size={16} />
			</div>
		</div>
	);
};

export default DirectionArrow;
