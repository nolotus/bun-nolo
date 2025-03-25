// create/space/components/SpaceLayout.tsx
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
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .space-content {
          background: ${theme.backgroundSecondary};
          border-radius: 16px;
          padding: 24px;
          min-height: 600px;
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 400px;
          color: ${theme.textSecondary};
        }

        @media (max-width: 768px) {
          .space-layout {
            padding: 12px;
          }

          .space-content {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default SpaceLayout;
