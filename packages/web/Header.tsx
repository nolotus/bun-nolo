import { ThreeBarsIcon, HomeIcon, LocationIcon } from "@primer/octicons-react";
import clsx from "clsx";
import React, { useState, useEffect, useCallback } from "react";
import { DesktopMenu } from "render/layout/blocks/DesktopMenu"; // 假设这些是拆分后的组件
import { MobileMenu } from "render/layout/blocks/MobileMenu"; // 假设这些是拆分后的组件
import { UserControls } from "user/blocks/UserControls";
const nav = [
	{ path: "/", label: "首页", icon: <HomeIcon size={24} /> },
	// { path: '/nomadspots', label: '旅居点' },
	{ path: "/spots", label: "兴趣点", icon: <LocationIcon size={24} /> },
	// { path: '/itineraries', label: '行程' },
	// { path: '/peoples', label: '游民' },
	// { path: '/gears', label: '装备' },
];
export const Header: React.FC = () => {
	const [isSticky, setIsSticky] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const handleScroll = useCallback(() => {
		setIsSticky(window.pageYOffset > 0);
	}, []);

	useEffect(() => {
		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [handleScroll]);

	const handleMobileMenuToggle = useCallback(() => {
		setIsMobileMenuOpen((prevState) => !prevState);
	}, []);

	return (
		<header
			className={clsx("bg-white", {
				"fixed top-0 left-0 right-0 bg-gray-200 shadow-md": isSticky,
			})}
		>
			<div className="container mx-auto ">
				<div className="flex justify-between items-center">
					<button onClick={handleMobileMenuToggle} className="lg:hidden">
						<ThreeBarsIcon size={24} />
					</button>
					<DesktopMenu navItems={nav} />
					<UserControls />
				</div>
			</div>

			<MobileMenu
				isOpen={isMobileMenuOpen}
				toggleMenu={handleMobileMenuToggle}
				navItems={nav}
			/>
		</header>
	);
};
