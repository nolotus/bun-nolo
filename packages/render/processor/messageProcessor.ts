import { unified } from "unified";

import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";

export const messageProcessor = unified().use(remarkParse).use(remarkGfm);
