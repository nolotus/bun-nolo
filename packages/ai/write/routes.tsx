// routes.ts
import withDynamicImport from "utils/withDynamicImport";

const Home = withDynamicImport(() => import("./Home"));
const Writing = withDynamicImport(() => import("./Index"));

export const routes = {
  "/": { title: "Home", component: Home },
  "/writing": { title: "Writing", component: Writing },
};
