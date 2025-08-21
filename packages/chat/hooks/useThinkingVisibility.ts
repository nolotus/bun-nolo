// hooks/useThinkingVisibility.ts

import { useState, useCallback, useEffect } from "react";

export const useThinkingVisibility = (
  showThinking: boolean,
  content: any,
  thinkContent: string
) => {
  const init = showThinking && !!thinkContent && !content;
  const [isExpanded, setIsExpanded] = useState(init);
  const [manual, setManual] = useState(false);

  const toggle = useCallback(() => {
    setManual(true);
    setIsExpanded((v) => !v);
  }, []);

  useEffect(() => {
    if (content && isExpanded && !manual) {
      const t = setTimeout(() => setIsExpanded(false), 300);
      return () => clearTimeout(t);
    }
  }, [content, isExpanded, manual]);

  return [isExpanded, toggle] as const;
};
