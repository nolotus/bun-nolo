import { AnimatePresence, motion } from "framer-motion";
import React, { Suspense } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { CommentIcon } from "@primer/octicons-react";
import Borders from "open-props/src/borders";
import Colors from "open-props/src/colors";

const Layout = ({ disableAnimation = false }) => {
  const location = useLocation();
  const navigate = useNavigate();

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
    <>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="mx-auto w-full flex-grow sm:py-8 md:py-12">
          <Suspense fallback={<div>loading</div>}>{renderContent()}</Suspense>
        </div>
      </div>

      <button
        type="button"
        className="surface2 brand p-[10px]"
        style={{
          position: "fixed",
          bottom: "100px",
          left: "40px",
          borderRadius: Borders["--radius-round"],
        }}
        onClick={() => {
          navigate("/chat");
        }}
      >
        <CommentIcon fill={Colors["--gray-2"]} />
      </button>
    </>
  );
};

export default Layout;
