import type React from "react";
import { Suspense, lazy } from "react";
import { PageLoader } from "render/blocks/PageLoader";

const LazyLoadWrapper = ({ component }: { component: React.ReactNode }) => (
	<Suspense fallback={<PageLoader />}>{component}</Suspense>
);

export const createLazyRoute = (path: string, importFn: () => Promise<any>) => {
	const LazyComponent = lazy(importFn);
	return {
		path,
		element: <LazyLoadWrapper component={<LazyComponent />} />,
	};
};
