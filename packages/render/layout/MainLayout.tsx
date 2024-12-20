// MainLayout.tsx
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

	const pageTransitionConfig = {
		timeout: 300,
		classNames: {
			enter: "page-enter",
			enterActive: "page-enter-active",
			exit: "page-exit",
			exitActive: "page-exit-active",
		},
		onEnter: (node: HTMLElement) => {
			window.scrollTo(0, 0);
		},
	};

	const getSidebarContent = () => {
		let currentSidebar = isLoggedIn ? <ChatSidebar /> : null;
		const lastValidSidebarRef = React.useRef<React.ReactNode>(null);

		if (location.pathname === "/") {
			currentSidebar = <HomeSidebarContent />;
		} else if (location.pathname.startsWith("/life")) {
			currentSidebar = <LifeSidebarContent />;
		} else if (location.pathname.startsWith("/chat")) {
			currentSidebar = <ChatSidebar />;
		}

		if (currentSidebar) {
			lastValidSidebarRef.current = currentSidebar;
			return currentSidebar;
		}

		return lastValidSidebarRef.current;
	};

	const isChatDetailPage =
		location.pathname.startsWith("/chat/") && location.pathname !== "/chat";

	return (
		<>
			<style>
				{`
          .page {
            position: relative;
            width: 100%;
            min-height: 100vh;
            will-change: transform, opacity;
            transform-style: preserve-3d;
            contain: layout style paint;
          }

          .page-enter {
            opacity: 0;
            transform: translateX(10px);
          }

          .page-enter-active {
            opacity: 1;
            transform: translateX(0);
            transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
            backface-visibility: hidden;
            perspective: 1000px;
          }

          .page-exit {
            opacity: 1;
            transform: translateX(0);
          }

          .page-exit-active {
            opacity: 0;
            transform: translateX(-10px);
            transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
            backface-visibility: hidden;
            perspective: 1000px;
          }

          .page-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-size: 1.2rem;
            color: #666;
          }

          .page > * {
            max-width: 100%;
            overflow-x: hidden;
          }

          @media (hover: none) {
            .page {
              transform: translateZ(0);
              -webkit-transform: translateZ(0);
            }
          }

          .page * {
            backface-visibility: hidden;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        `}
			</style>

			<Sidebar
				sidebarContent={getSidebarContent()}
				fullWidth={isChatDetailPage}
			>
				<Suspense fallback={<div className="page-loading">Loading...</div>}>
					<TransitionGroup>
						<CSSTransition
							key={location.pathname}
							{...pageTransitionConfig}
							unmountOnExit
						>
							<div className="page">
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
