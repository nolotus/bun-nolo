// Router.tsx
import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { routes } from "ai/write/routes";
import ErrorBoundary from "./components/ErrorBoundary";
import { useRoute } from "./RouteContext";

const Router: React.FC = () => {
  const { currentPath } = useRoute();
  const routeOrder = ["/", "/writing"];
  const currentIndex = routeOrder.indexOf(currentPath);
  const controls = useAnimation();

  useEffect(() => {
    controls.start({ x: `${-currentIndex * 100}%` });
  }, [currentIndex, controls]);

  return (
    <ErrorBoundary fallback={<div>Error loading this component</div>}>
      <div style={{ position: "relative", height: "100%", overflow: "hidden" }}>
        <motion.div
          style={{
            display: "flex",
            height: "100%",
          }}
          animate={controls}
          transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
        >
          {routeOrder.map((path, index) => {
            const Route = routes[path];
            const Component = Route.component;
            return (
              <motion.div
                key={path}
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  flex: "0 0 100%",
                }}
                animate={{
                  scale: currentIndex === index ? 1 : 0.9,
                  opacity: currentIndex === index ? 1 : 0.5,
                }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                  }}
                  animate={{
                    x: `${(index - currentIndex) * 10}%`,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <Component />
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </ErrorBoundary>
  );
};

export default Router;
