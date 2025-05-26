// render/elements/Heading.tsx
import React, { useMemo } from "react";
import { useTheme } from "app/theme";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type HeadingProps = {
  attributes: any;
  children: React.ReactNode;
  element: any;
  level: HeadingLevel;
};

const useHeadingStyles = (theme, level: HeadingLevel) => {
  return useMemo(() => {
    const baseStyles = {
      1: {
        fontSize: "1.875em",
        margin: `${theme.space[8]} 0 ${theme.space[4]}`,
        fontWeight: 700,
        letterSpacing: "-0.025em",
        lineHeight: 1.2,
      },
      2: {
        fontSize: "1.5em",
        margin: `${theme.space[6]} 0 ${theme.space[3]}`,
        fontWeight: 650,
        letterSpacing: "-0.02em",
        lineHeight: 1.3,
      },
      3: {
        fontSize: "1.25em",
        margin: `${theme.space[5]} 0 ${theme.space[2]}`,
        fontWeight: 600,
        letterSpacing: "-0.015em",
        lineHeight: 1.4,
      },
      4: {
        fontSize: "1.125em",
        margin: `${theme.space[4]} 0 ${theme.space[2]}`,
        fontWeight: 600,
        letterSpacing: "-0.01em",
        lineHeight: 1.45,
      },
      5: {
        fontSize: "1.0625em",
        margin: `${theme.space[3]} 0 ${theme.space[1]}`,
        fontWeight: 600,
        letterSpacing: "-0.005em",
        lineHeight: 1.5,
      },
      6: {
        fontSize: "0.875em",
        margin: `${theme.space[3]} 0 ${theme.space[1]}`,
        fontWeight: 600,
        letterSpacing: "0em",
        lineHeight: 1.6,
        textTransform: "uppercase" as const,
        opacity: 0.8,
      },
    };

    return {
      ...baseStyles[level],
      color: theme.text,
    };
  }, [theme, level]);
};

export const Heading: React.FC<HeadingProps> = ({
  attributes,
  children,
  element,
  level,
}) => {
  const theme = useTheme();
  const styles = useHeadingStyles(theme, level);

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  const headingStyle = {
    ...styles,
    ...(element.align ? { textAlign: element.align } : {}),
  };

  return (
    <Tag {...attributes} style={headingStyle}>
      {children}
    </Tag>
  );
};
