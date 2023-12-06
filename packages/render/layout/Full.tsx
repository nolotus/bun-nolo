import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "web/Header";

const Layout = () => {
	return (
		<div className="bg-neutral-200 flex flex-col min-h-screen">
			<Header />
			<div className="w-full  flex-grow">
				<Outlet />
			</div>
		</div>
	);
};

export default Layout;
