// App.tsx
import React, { useRef, useEffect } from "react";
import Layout from "ai/write/Layout";
import { routes, NotFound } from "ai/write/routes";
import ErrorBoundary from "./components/ErrorBoundary";
import PerformanceMonitor from "./components/PerformanceMonitor";
import { RouteProvider, useRoute } from "./RouteContext";
import { motion, useAnimation, PanInfo, useMotionValue } from "framer-motion";

interface AppProps {
  initialPath: string;
}

function App({ initialPath }: AppProps) {
  return (
    <ErrorBoundary>
      {typeof window !== "undefined" && <PerformanceMonitor />}
      <RouteProvider initialPath={initialPath}>
        <Layout>
          <Router />
        </Layout>
      </RouteProvider>
    </ErrorBoundary>
  );
}

const Router: React.FC = () => {
  const { currentPath, navigate } = useRoute();
  const routeOrder = ["/", "/writing"];
  const currentIndex = routeOrder.indexOf(currentPath);
  const controls = useAnimation();
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    controls.start({ x: `${-currentIndex * 100}%` });
  }, [currentIndex, controls]);

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const threshold = 50; // 滑动阈值
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
      const direction = velocity < 0 || offset < 0 ? 1 : -1;
      const nextIndex = Math.max(
        0,
        Math.min(routeOrder.length - 1, currentIndex + direction),
      );
      navigate(routeOrder[nextIndex]);
    } else {
      controls.start({ x: `${-currentIndex * 100}%` });
    }
  };

  return (
    <ErrorBoundary fallback={<div>Error loading this component</div>}>
      <div
        ref={containerRef}
        style={{ position: "relative", height: "100%", overflow: "hidden" }}
      >
        <motion.div
          drag="x"
          dragConstraints={containerRef}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          style={{ display: "flex", height: "100%", x }}
          animate={controls}
          transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
        >
          {routeOrder.map((path, index) => {
            const Route = routes[path] || {
              title: "Not Found",
              component: NotFound,
            };
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
                    x: useMotionValue(0),
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

export default App;
