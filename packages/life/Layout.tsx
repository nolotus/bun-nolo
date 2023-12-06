import { useAuth } from "app/hooks";
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "web/Header";

import { Sidebar } from "./blocks/Sidebar";
import { useFetchData } from "./hooks/useFetchData";
export const Layout = () => {
	const { fetchData } = useFetchData();
	const auth = useAuth();

	useEffect(() => {
		auth.user?.userId && fetchData(auth.user?.userId);
	}, [auth.user?.userId]);
	return (
		<div className="flex h-screen flex-col bg-neutral-200">
			<Header />
			<div className="flex flex-1 overflow-hidden">
				<Sidebar />
				<main className="flex-1 overflow-y-auto p-4 transition duration-500 ease-snappy sm:p-6 lg:p-8">
					<Outlet />
				</main>
			</div>
		</div>
	);
};
