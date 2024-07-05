import { unified } from "unified";

import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";

export const messageProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath);
