import React, { useState, useRef, useEffect } from "react";
import zIndex from "app/styles/z-index";

interface DropDownProps {
	trigger: React.ReactNode;
	children: React.ReactNode;
	triggerType?: "click" | "hover"; // 使 triggerType 变成可选属性
}

const DropDown: React.FC<DropDownProps> = ({
	trigger,
	children,
	triggerType = "hover",
}) => {
	// triggerType 默认值设置为 'hover'
	const node = useRef<HTMLDivElement | null>(null);
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const handleClickOutside = (e: MouseEvent) => {
		if (!node.current || node.current.contains(e.target as Node)) {
			return;
		}
		setIsOpen(false);
	};

	const handleEscapeKey = (e: KeyboardEvent) => {
		if (e.key === "Escape") {
			setIsOpen(false);
		}
	};

	useEffect(() => {
		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			document.addEventListener("keydown", handleEscapeKey);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscapeKey);
		};
	}, [isOpen]);

	const toggleDropDown = () => setIsOpen((prev) => !prev);

	// 根据 triggerType 来设置不同的事件处理器
	const eventHandlers =
		triggerType === "click"
			? {
					onClick: toggleDropDown,
			  }
			: {
					onMouseEnter: () => setIsOpen(true),
					onMouseLeave: () => setIsOpen(false),
			  };

	return (
		<div className="relative" ref={node} {...eventHandlers}>
			<div className="focus:outline-none">{trigger}</div>
			{isOpen && (
				<div
					className="absolute right-0 w-56 bg-white" // 移除了 z-50 类
					style={{ transform: "scale(1)", opacity: 1, zIndex: zIndex.dropdown }}
				>
					<div className="py-1">{children}</div>
				</div>
			)}
		</div>
	);
};

export default DropDown;
