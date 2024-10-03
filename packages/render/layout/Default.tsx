import { AnimatePresence, motion } from "framer-motion";
import React, { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";

interface DefaultProps {
  disableAnimation?: boolean;
}

const Default: React.FC<DefaultProps> = ({ disableAnimation = false }) => {
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

  return <Suspense fallback={<div>loading</div>}>{renderContent()}</Suspense>;
};

export default Default;
