import type React from "react";
import { useCallback, useMemo, useState } from "react";

interface DropDownProps {
	trigger: React.ReactNode;
	children: React.ReactNode;
	triggerType?: "click" | "hover";
	direction?: "top" | "bottom" | "left" | "right";
}

const DropDown: React.FC<DropDownProps> = ({
	trigger,
	children,
	triggerType = "hover",
	direction = "bottom",
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const handleMouseEnter = useCallback(() => {
		if (triggerType === "hover") {
			setIsOpen(true);
		}
	}, [triggerType]);

	const handleMouseLeave = useCallback(() => {
		if (triggerType === "hover") {
			setIsOpen(false);
		}
	}, [triggerType]);

	const handleClick = useCallback(() => {
		if (triggerType === "click") {
			setIsOpen(!isOpen);
		}
	}, [triggerType, isOpen]);

	const positionStyle = useMemo(() => {
		switch (direction) {
			case "top":
				return { bottom: "100%", right: 0 };
			case "right":
				return { left: "100%", top: 0 };
			case "left":
				return { right: "100%", top: 0 };
			default:
				return { top: "100%", right: 0 };
		}
	}, [direction]);

	return (
		<div
			style={{ position: "relative" }}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onClick={handleClick}
		>
			{trigger}
			{isOpen && (
				<div
					style={{
						position: "absolute",
						zIndex: 100,
						...positionStyle,
					}}
				>
					{children}
				</div>
			)}
		</div>
	);
};

export default DropDown;
