import React, { Suspense, lazy, ComponentType } from 'react';

interface LazyLoadProps {
  factory: () => Promise<{ default: ComponentType<any> }>;
  fallback: React.ReactNode;
}

const LazyLoadComponent: React.FC<LazyLoadProps> = ({ factory, fallback }) => {
  const Component = lazy(factory);
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  );
};

export default LazyLoadComponent;
