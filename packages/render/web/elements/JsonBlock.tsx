// JsonBlock.tsx
import React, { useMemo } from "react";
import { JsonView, allExpanded, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import { useTheme } from "app/theme"; // Assume theme hook path is correct

// --- 类型定义 ---
interface JsonBlockProps {
  rawCode: string;
  showPreview: boolean;
  codeBlockPadding: string;
  className?: string;
}

// Keep AppTheme type or use your actual theme type
type AppTheme =
  | {
      mode?: "dark" | "light";
      space?: Record<string | number, string>;
      backgroundSecondary?: string;
      backgroundGhost?: string;
      text?: string;
      textSecondary?: string;
      colorString?: string;
      colorNumber?: string;
      colorBoolean?: string;
      colorNull?: string;
      colorProperty?: string;
    }
  | null
  | undefined;

// REMOVED getThemeValue function

const JsonBlock: React.FC<JsonBlockProps> = ({
  rawCode,
  showPreview,
  codeBlockPadding,
  className = "",
}) => {
  const theme: AppTheme = useTheme();

  // 1. Memoized JSON Parsing (remains the same)
  const { jsonData, parseError } = useMemo(() => {
    if (!rawCode || rawCode.trim() === "") {
      return { jsonData: null, parseError: null };
    }
    try {
      const data = JSON.parse(rawCode);
      return { jsonData: data, parseError: null };
    } catch (error: any) {
      console.error("JSON parse error in JsonBlock:", error);
      return { jsonData: null, parseError: true };
    }
  }, [rawCode]);

  // 2. Determine if preview should be shown (remains the same)
  const shouldRenderPreview =
    showPreview && jsonData !== null && parseError === null;

  // 3. Memoized JsonView Styles - Access theme directly
  const jsonViewStyle: any = useMemo(() => {
    // Use optional chaining and nullish coalescing directly
    const baseTextColor =
      theme?.text ?? (defaultStyles.basicChildStyle?.color || "#000");
    const secondaryTextColor = theme?.textSecondary ?? "#888";

    return {
      ...defaultStyles,
      container: { padding: "0", margin: "0", fontFamily: "inherit" },
      basicChildStyle: {
        ...defaultStyles.basicChildStyle,
        color: baseTextColor,
        marginLeft: "15px",
      },
      label: {
        ...defaultStyles.label,
        color: theme?.colorProperty ?? "#881391",
        fontWeight: "bold",
      },
      valueText: {
        ...defaultStyles.valueText,
        color: theme?.colorString ?? "#067d17",
      },
      value: {
        ...defaultStyles.value,
        '&[data-type="number"]': { color: theme?.colorNumber ?? "#1750eb" },
        '&[data-type="boolean"]': { color: theme?.colorBoolean ?? "#1750eb" },
        '&[data-type="null"]': { color: theme?.colorNull ?? "#777" },
        '&[data-type="string"]': { color: theme?.colorString ?? "#067d17" },
        '&[data-type="undefined"]': { color: secondaryTextColor },
      },
    };
  }, [theme]); // Dependency on theme object

  // 4. Render Logic (remains the same)
  if (shouldRenderPreview) {
    return (
      <div className={`json-view-wrapper ${className}`}>
        <JsonView
          data={jsonData}
          shouldExpandNode={allExpanded}
          style={jsonViewStyle}
        />
      </div>
    );
  } else {
    return (
      <pre className={`code-content-fallback ${className}`}>
        {rawCode || ""}
      </pre>
    );
  }
};

export default JsonBlock;
