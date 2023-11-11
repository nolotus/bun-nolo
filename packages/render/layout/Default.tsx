import { AnimatePresence, motion } from 'framer-motion';
import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

// import Footer from '../blocks/Footer';

import { Header } from './blocks/Header';

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
          initial={{ opacity: 0, visibility: 'hidden' }}
          animate={{ opacity: 1, visibility: 'visible' }}
          exit={{ opacity: 0, visibility: 'hidden' }}
          transition={{ duration: 0.3, when: 'beforeChildren' }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="bg-[#e2e1e0] bg-opacity-70 flex flex-col min-h-screen">
      <Header />
      <div className="max-w-7xl w-full mx-auto p-8 md:p-16 flex-grow">
        <Suspense fallback={<div>hi</div>}>{renderContent()}</Suspense>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Layout;
