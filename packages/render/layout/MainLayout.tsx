import HomeSidebarContent from "app/pages/HomeSidebarContent";
import { useAuth } from "auth/useAuth";
import ChatSidebar from "chat/ChatSidebar";
import LifeSidebarContent from "life/LifeSidebarContent";
import React, { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import Sidebar from "render/layout/Sidebar";

const MainLayout: React.FC = () => {
	const location = useLocation();
	const { isLoggedIn } = useAuth();

	const getSidebarContent = () => {
		let currentSidebar = isLoggedIn ? <ChatSidebar /> : null;
		const lastValidSidebarRef = React.useRef<React.ReactNode>(null);

		if (location.pathname === "/") {
			currentSidebar = <HomeSidebarContent />;
		} else if (location.pathname.startsWith("/life")) {
			currentSidebar = <LifeSidebarContent />;
		} else if (location.pathname.startsWith("/create")) {
			currentSidebar = <ChatSidebar />;
		}

		if (currentSidebar) {
			lastValidSidebarRef.current = currentSidebar;
			return currentSidebar;
		}

		return lastValidSidebarRef.current;
	};

	return (
		<>
			<style>{`
        .page-enter {
          opacity: 0;
          visibility: hidden;
        }
        .page-enter-active {
          opacity: 1;
          visibility: visible;
          transition: opacity 300ms, visibility 300ms;
        }
        .page-exit {
          opacity: 1;
          visibility: visible;
        }
        .page-exit-active {
          opacity: 0;
          visibility: hidden;
          transition: opacity 300ms, visibility 300ms;
        }
      `}</style>

			<Sidebar sidebarContent={getSidebarContent()}>
				<Suspense fallback={<div>Loading...</div>}>
					<TransitionGroup>
						<CSSTransition
							key={location.pathname}
							timeout={300}
							classNames="page"
							unmountOnExit
						>
							<div>
								<Outlet />
							</div>
						</CSSTransition>
					</TransitionGroup>
				</Suspense>
			</Sidebar>
		</>
	);
};

export default MainLayout;
