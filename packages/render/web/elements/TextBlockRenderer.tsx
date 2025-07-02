// render/web/elements/TextBlockRenderer.tsx
import React from "react";
import { NavLink } from "react-router-dom";

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

// 链接分析逻辑不变
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

export const SafeLink: React.FC<SafeLinkProps> = ({
  attributes,
  children,
  href,
  ...props
}) => {
  const { href: finalHref, isExternal } = getLinkInfo(href);
  if (isExternal) {
    return (
      <a
        href={finalHref}
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
    <NavLink to={finalHref} {...attributes} {...props}>
      {children}
    </NavLink>
  );
};

// HTML 标签映射
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

// 基于 CSS 变量和类名的样式定义
const textBlockStyles = `
  /* 公共基础 */
  .text-block {
    color: var(--text);
    font-family: system-ui, -apple-system, sans-serif;
    font-feature-settings: "kern" 1, "liga" 1;
    text-rendering: optimizeLegibility;
    margin: 0;
  }

  /* 标题样式 */
  .text-heading-one {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.25;
    margin: var(--space-10) 0 var(--space-5);
    letter-spacing: -0.025em;
  }
  .text-heading-two {
    font-size: 1.5rem;
    font-weight: 650;
    line-height: 1.3;
    margin: var(--space-8) 0 var(--space-4);
    letter-spacing: -0.02em;
  }
  .text-heading-three {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.4;
    margin: var(--space-6) 0 var(--space-3);
    letter-spacing: -0.015em;
  }
  .text-heading-four {
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.45;
    margin: var(--space-5) 0 var(--space-2);
    letter-spacing: -0.01em;
  }
  .text-heading-five {
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.5;
    margin: var(--space-4) 0 var(--space-2);
    letter-spacing: -0.005em;
  }
  .text-heading-six {
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1.6;
    text-transform: uppercase;
    opacity: 0.75;
    margin: var(--space-3) 0 var(--space-1);
  }

  /* 段落 */
  .text-paragraph {
    font-size: 1rem;
    line-height: 1.65;
    margin: var(--space-3) 0;
    max-width: 65ch;
    hyphens: auto;
  }
  .text-paragraph.nested {
    margin: var(--space-2) 0;
  }

  /* 引用块 */
  .text-quote {
    font-size: 1.0625rem;
    font-style: italic;
    color: var(--textSecondary);
    margin: var(--space-5) 0;
    padding: var(--space-3) var(--space-5);
    border-left: 3px solid var(--primary);
    border-radius: 0 var(--space-1) var(--space-1) 0;
    background-color: var(--backgroundSecondary);
    box-shadow: inset 3px 0 0 var(--primary), var(--shadow1);
  }
  .text-quote cite {
    display: block;
    margin-top: var(--space-3);
    text-align: right;
    font-style: normal;
    font-size: 0.875rem;
    color: var(--textTertiary);
    font-weight: 500;
  }

  /* 分割线 */
  .text-thematic-break {
    width: 100%;
    height: 1px;
    border: none;
    background-color: var(--border);
    margin: var(--space-6) 0;
    background-image: linear-gradient(90deg, transparent, var(--border), transparent);
  }

  /* 对齐 */
  .align-left { text-align: left; }
  .align-center { text-align: center; }
  .align-right { text-align: right; }
  .align-justify { text-align: justify; }
`;

export const TextBlockRenderer: React.FC<TextBlockProps> = ({
  attributes,
  children,
  element,
}) => {
  const HtmlTag = TAG_MAP[element.type];
  // 组合类名
  const classNames = ["text-block", `text-${element.type}`];
  if (element.align) classNames.push(`align-${element.align}`);
  if (element.type === "paragraph" && element.isNested)
    classNames.push("nested");

  return (
    <>
      <HtmlTag {...attributes} className={classNames.join(" ")}>
        {children}
        {element.type === "quote" && element.cite && (
          <cite>— {element.cite}</cite>
        )}
      </HtmlTag>
      <style href="text-block-elements" precedence="medium">
        {textBlockStyles}
      </style>
    </>
  );
};
