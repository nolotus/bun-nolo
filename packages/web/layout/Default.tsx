import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./blocks/Header";
import Footer from "../blocks/Footer";
import { AnimatePresence, motion } from "framer-motion";

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
    <div className="bg-[#D5DDE0] bg-opacity-70 flex flex-col min-h-screen">
      <Header />
      <div className="max-w-7xl w-full mx-auto p-8 md:p-16 flex-grow">
        {renderContent()}
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Layout;
