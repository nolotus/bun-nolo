// utils/withDynamicImport.tsx
import React, { Suspense, lazy } from "react";

interface WithDynamicImportOptions {
  fallback?: React.ReactNode;
  preload?: boolean;
}

function withDynamicImport<P extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  options: WithDynamicImportOptions = {},
) {
  const LazyComponent = lazy(importFunc);

  if (options.preload) {
    // 触发预加载
    importFunc();
  }

  return (props: P) => (
    <Suspense fallback={options.fallback || <div>Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

export default withDynamicImport;
