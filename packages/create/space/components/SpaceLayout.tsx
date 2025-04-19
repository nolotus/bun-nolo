import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import SpaceNavigation from "./SpaceNavigation";
import { useTheme } from "app/theme";

const SpaceLayout: React.FC = () => {
  const theme = useTheme();

  return (
    <div className="space-layout">
      <SpaceNavigation />

      <div className="space-content">
        <Suspense fallback={<div className="loading">加载中...</div>}>
          <Outlet />
        </Suspense>
      </div>

      <style>{`
        .space-layout {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: ${theme.space[5]};
        }

        .space-content {
          border-radius: 16px;
          min-height: 600px;
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 400px;
          color: ${theme.textTertiary};
        }

        @media (max-width: 768px) {
          .space-layout {
            padding: ${theme.space[3]};
          }

          .space-content {
            padding: ${theme.space[4]};
          }
        }
      `}</style>
    </div>
  );
};

export default SpaceLayout;
