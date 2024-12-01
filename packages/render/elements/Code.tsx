import React, { Suspense, useState, memo, useCallback, useEffect } from "react";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  dracula,
  vscDarkPlus,
  vs,
  synthwave84,
  solarizedDarkAtom,
  shadesOfPurple,
  pojoaque,
  oneLight,
  oneDark,
  nord,
  nightOwl,
  materialOceanic,
  materialLight,
  materialDark,
  lucario,
  hopscotch,
  holiTheme,
  gruvboxLight,
  gruvboxDark,
  ghcolors,
  duotoneSpace,
  duotoneSea,
  duotoneLight,
  darcula,
  coyWithoutShadows,
  coldarkDark,
  coldarkCold,
  cb,
  base16AteliersulphurpoolLight,
  atomDark,
  a11yDark,
  prism,
  twilight,
  tomorrow,
  solarizedlight,
  okaidia,
  funky,
  dark,
  coy,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import copyToClipboard from "utils/clipboard";
import { CodeBlockHeader } from "./CodeBlockHeader";

const styles = {
  wrapper: {
    position: "relative" as const,
    margin: "1em 0",
  },
};

// ErrorBoundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const loadLanguage = async (language: string) => {
  try {
    const module = await import(
      `react-syntax-highlighter/dist/esm/languages/prism/${language}`
    );
    SyntaxHighlighter.registerLanguage(language, module.default);
  } catch (error) {
    console.error(`Failed to load language ${language}:`, error);
  }
};

const preloadCommonLanguages = () => {
  const commonLanguages = ["javascript", "typescript", "jsx", "tsx"];
  commonLanguages.forEach((lang) => loadLanguage(lang));
};

interface HighlighterProps {
  language: string;
  code: string;
  isDarkMode: boolean;
  darkTheme: any;
  lightTheme: any;
}

const LazyHighlighter = React.lazy(async () => {
  const HighlighterComponent = ({
    language,
    code,
    isDarkMode,
    darkTheme,
    lightTheme,
  }: HighlighterProps) => (
    <SyntaxHighlighter
      language={language}
      style={isDarkMode ? darkTheme : lightTheme}
      customStyle={{ margin: 0, borderRadius: "0 0 4px 4px" }}
      showLineNumbers
      wrapLines
      wrapLongLines
    >
      {code}
    </SyntaxHighlighter>
  );
  return { default: memo(HighlighterComponent) };
});

interface CodeBlockProps {
  attributes?: any;
  element: {
    children: Array<{ text: string }>;
    language?: string;
  };
  children?: React.ReactNode;
  isDarkMode?: boolean;
  lightTheme?: any;
  darkTheme?: any;
}

export const CodeBlock = memo(
  ({
    attributes,
    element,
    children,
    isDarkMode = false,
    lightTheme = prism,
    darkTheme = atomDark,
  }: CodeBlockProps) => {
    const [isCopied, setIsCopied] = useState(false);
    const code = element.children[0].text;
    const language = element.language || "text";

    useEffect(() => {
      preloadCommonLanguages();
    }, []);

    const handleCopy = useCallback(() => {
      copyToClipboard(code, {
        onSuccess: () => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        },
        onError: (error) => {
          console.error("Failed to copy:", error);
        },
      });
    }, [code]);

    const handleChat = useCallback(() => {
      // Chat 功能实现
      console.log("Chat clicked");
    }, []);

    const handlePreview = useCallback(() => {
      // Preview 功能实现
      console.log("Preview clicked");
    }, []);

    const handleSave = useCallback(() => {
      // Save 功能实现
      console.log("Save clicked");
    }, []);

    return (
      <div {...attributes} style={styles.wrapper}>
        <CodeBlockHeader
          language={language}
          isCopied={isCopied}
          onChat={handleChat}
          onPreview={handlePreview}
          onSave={handleSave}
          onCopy={handleCopy}
          isDarkMode={isDarkMode}
        />
        <ErrorBoundary
          fallback={
            <div style={{ padding: "1em", color: "red" }}>
              Error loading syntax highlighter
            </div>
          }
        >
          <Suspense
            fallback={<div style={{ padding: "1em" }}>Loading language...</div>}
          >
            <LazyHighlighter
              language={language}
              code={code}
              isDarkMode={isDarkMode}
              darkTheme={darkTheme}
              lightTheme={lightTheme}
            />
          </Suspense>
        </ErrorBoundary>
      </div>
    );
  },
);

CodeBlock.displayName = "CodeBlock";
