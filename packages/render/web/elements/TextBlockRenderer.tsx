// render/web/elements/TextBlockRenderer.tsx
import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "app/theme";

type TextBlockType =
  | "paragraph"
  | "heading-one"
  | "heading-two"
  | "heading-three"
  | "heading-four"
  | "heading-five"
  | "heading-six"
  | "quote"
  | "thematic-break";

type TextBlockProps = {
  attributes: any;
  children: React.ReactNode;
  element: {
    type: TextBlockType;
    align?: "left" | "center" | "right" | "justify";
    isNested?: boolean;
    cite?: string;
  };
};

type SafeLinkProps = {
  attributes?: any;
  children: React.ReactNode;
  href: string;
  [key: string]: any;
};

// 链接分析函数
const getLinkInfo = (
  rawHref: string | undefined
): { href: string; isExternal: boolean } => {
  if (!rawHref || typeof rawHref !== "string") {
    return { href: "about:blank", isExternal: true };
  }

  const href = rawHref.trim();

  if (/^(https?:|mailto:|tel:)/i.test(href)) {
    return { href, isExternal: true };
  }

  if (href.startsWith("//")) {
    return { href, isExternal: true };
  }

  if (href.includes(".") && !href.includes(" ") && !href.startsWith("/")) {
    return { href: `//${href}`, isExternal: true };
  }

  return { href, isExternal: false };
};

// SafeLink 组件
export const SafeLink: React.FC<SafeLinkProps> = ({
  attributes,
  children,
  href,
  ...props
}) => {
  const linkInfo = useMemo(() => getLinkInfo(href), [href]);

  if (linkInfo.isExternal) {
    return (
      <a
        href={linkInfo.href}
        target="_blank"
        rel="noopener noreferrer"
        {...attributes}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <NavLink to={linkInfo.href} {...attributes} {...props}>
      {children}
    </NavLink>
  );
};

// 标签映射
const TAG_MAP: Record<TextBlockType, keyof JSX.IntrinsicElements> = {
  "heading-one": "h1",
  "heading-two": "h2",
  "heading-three": "h3",
  "heading-four": "h4",
  "heading-five": "h5",
  "heading-six": "h6",
  quote: "blockquote",
  "thematic-break": "hr",
  paragraph: "p",
};

// 样式配置 Hook
const useTextBlockStyles = (theme: any, element: TextBlockProps["element"]) => {
  return useMemo(() => {
    const base = {
      color: theme.text,
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontFeatureSettings: '"kern" 1, "liga" 1',
      textRendering: "optimizeLegibility" as const,
    };

    const configs: Record<TextBlockType, React.CSSProperties> = {
      "heading-one": {
        ...base,
        fontSize: "2rem",
        fontWeight: 700,
        lineHeight: 1.25,
        margin: `${theme.space[10]} 0 ${theme.space[5]}`,
        letterSpacing: "-0.025em",
      },

      "heading-two": {
        ...base,
        fontSize: "1.5rem",
        fontWeight: 650,
        lineHeight: 1.3,
        margin: `${theme.space[8]} 0 ${theme.space[4]}`,
        letterSpacing: "-0.02em",
      },

      "heading-three": {
        ...base,
        fontSize: "1.25rem",
        fontWeight: 600,
        lineHeight: 1.4,
        margin: `${theme.space[6]} 0 ${theme.space[3]}`,
        letterSpacing: "-0.015em",
      },

      "heading-four": {
        ...base,
        fontSize: "1.125rem",
        fontWeight: 600,
        lineHeight: 1.45,
        margin: `${theme.space[5]} 0 ${theme.space[2]}`,
        letterSpacing: "-0.01em",
      },

      "heading-five": {
        ...base,
        fontSize: "1rem",
        fontWeight: 600,
        lineHeight: 1.5,
        margin: `${theme.space[4]} 0 ${theme.space[2]}`,
        letterSpacing: "-0.005em",
      },

      "heading-six": {
        ...base,
        fontSize: "0.875rem",
        fontWeight: 600,
        lineHeight: 1.6,
        textTransform: "uppercase" as const,
        opacity: 0.75,
        margin: `${theme.space[3]} 0 ${theme.space[1]}`,
      },

      paragraph: {
        ...base,
        fontSize: "1rem",
        lineHeight: 1.65,
        margin: element.isNested
          ? `${theme.space[2]} 0`
          : `${theme.space[3]} 0`,
        maxWidth: "65ch",
        hyphens: "auto",
      },

      quote: {
        ...base,
        fontSize: "1.0625rem",
        fontStyle: "italic",
        color: theme.textSecondary,
        margin: `${theme.space[5]} 0`,
        padding: `${theme.space[3]} ${theme.space[5]}`,
        borderLeft: `3px solid ${theme.primary}`,
        borderRadius: `0 ${theme.space[1]} ${theme.space[1]} 0`,
        backgroundColor: theme.backgroundSecondary,
        boxShadow: `inset 3px 0 0 ${theme.primary}, ${theme.shadow1}`,
      },

      "thematic-break": {
        width: "100%",
        height: "1px",
        border: "none",
        backgroundColor: theme.border,
        margin: `${theme.space[6]} 0`,
        backgroundImage: `linear-gradient(90deg, transparent, ${theme.border}, transparent)`,
      },
    };

    return configs[element.type] || base;
  }, [theme, element.type, element.isNested]);
};

// 引用注释组件
const QuoteCitation = ({ cite, theme }: { cite: string; theme: any }) => (
  <cite
    style={{
      display: "block",
      marginTop: theme.space[3],
      textAlign: "right",
      fontStyle: "normal",
      fontSize: "0.875rem",
      color: theme.textTertiary,
      fontWeight: 500,
    }}
  >
    — {cite}
  </cite>
);

// 主文本块渲染组件
export const TextBlockRenderer: React.FC<TextBlockProps> = ({
  attributes,
  children,
  element,
}) => {
  const theme = useTheme();
  const HtmlTag = TAG_MAP[element.type];
  const style = useTextBlockStyles(theme, element);

  const finalStyle = element.align
    ? { ...style, textAlign: element.align }
    : style;

  if (element.type === "thematic-break") {
    return <HtmlTag {...attributes} style={finalStyle} />;
  }

  return (
    <HtmlTag {...attributes} style={finalStyle}>
      {children}
      {element.type === "quote" && element.cite && (
        <QuoteCitation cite={element.cite} theme={theme} />
      )}
    </HtmlTag>
  );
};
