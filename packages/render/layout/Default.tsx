import { AnimatePresence, motion } from "framer-motion";
import React, { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";

const Layout = ({ disableAnimation = false }) => {
  const location = useLocation();

  const renderContent = () => {
    if (disableAnimation) {
      return <Outlet />;
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, visibility: "hidden" }}
          animate={{ opacity: 1, visibility: "visible" }}
          exit={{ opacity: 0, visibility: "hidden" }}
          transition={{ duration: 0.3, when: "beforeChildren" }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-200">
      <Header />
      <div className="mx-auto w-full flex-grow sm:p-8 md:p-12">
        <Suspense fallback={<div>hi</div>}>{renderContent()}</Suspense>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Layout;
