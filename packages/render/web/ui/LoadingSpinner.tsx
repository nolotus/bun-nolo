// render/web/ui/LoadingSpinner.tsx
import type React from "react";

interface LoadingSpinnerProps {
  size?: number; // 直径
  thickness?: number; // 线宽
  className?: string;
}

const SpinnerStyles = () => (
  <style href="loading-spinner" precedence="medium">{`
    @keyframes loadingSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-spinner {
      display: inline-block;
      border-radius: 999px;
      border-style: solid;
      border-color: var(--backgroundTertiary);
      border-left-color: var(--primary);
      animation: loadingSpin 0.9s linear infinite;
      box-shadow: 0 1px 3px var(--shadowLight);
    }

    @media (prefers-reduced-motion: reduce) {
      .loading-spinner {
        animation: none;
      }
    }
  `}</style>
);

function LoadingSpinner({
  size = 16,
  thickness = 2,
  className = "",
}: LoadingSpinnerProps) {
  return (
    <>
      <SpinnerStyles />
      <span
        className={`loading-spinner ${className}`.trim()}
        style={{
          width: size,
          height: size,
          borderWidth: thickness,
        }}
        aria-hidden="true"
      />
    </>
  );
}

export default LoadingSpinner;
