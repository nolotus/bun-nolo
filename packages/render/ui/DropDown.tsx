import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { CSSTransition } from "react-transition-group";

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
		<>
			<style>
				{`
          .dropdown-enter {
            opacity: 0;
            transform: scale(0.9);
          }
          
          .dropdown-enter-active {
            opacity: 1;
            transform: scale(1);
            transition: opacity 200ms, transform 200ms;
          }
          
          .dropdown-exit {
            opacity: 1;
            transform: scale(1);
          }
          
          .dropdown-exit-active {
            opacity: 0;
            transform: scale(0.9);
            transition: opacity 200ms, transform 200ms;
          }
        `}
			</style>

			<div
				style={{ position: "relative" }}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				onClick={handleClick}
			>
				{trigger}
				<CSSTransition
					in={isOpen}
					timeout={200}
					classNames="dropdown"
					unmountOnExit
				>
					<div
						style={{
							position: "absolute",
							zIndex: 100,
							...positionStyle,
						}}
					>
						{children}
					</div>
				</CSSTransition>
			</div>
		</>
	);
};

export default DropDown;
