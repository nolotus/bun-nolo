// routes.ts
import withDynamicImport from "utils/withDynamicImport";

const Home = withDynamicImport(() => import("./components/Home"));
const Writing = withDynamicImport(() => import("ai/Writing"));
const NotFound = withDynamicImport(() => import("./components/NotFound"));

export const routes = {
  "/": { title: "Home", component: Home },
  "/writing": { title: "Writing", component: Writing },
};

export { NotFound };
