import React, { useMemo } from "react";

const allowedSchemes = ["http:", "https:", "mailto:", "tel:"];

const SafeLink = ({ attributes, children, href }) => {
  const safeHref = useMemo(() => {
    let parsedUrl = null;
    try {
      parsedUrl = new URL(href);
      // eslint-disable-next-line no-empty
    } catch {}
    if (parsedUrl && allowedSchemes.includes(parsedUrl.protocol)) {
      return parsedUrl.href;
    }
    return "about:blank";
  }, [href]);
  return (
    <a href={safeHref} {...attributes}>
      {children}
    </a>
  );
};
const ImageElement = ({ attributes, children, element }) => {
  return (
    <div {...attributes}>
      {children}
      <img
        src={element.url}
        style={{
          display: "block",
          maxWidth: "100%",
          maxHeight: "20em",
        }}
      />
    </div>
  );
};

export const Element = (props) => {
  const { attributes, children, element } = props;
  switch (element.type) {
    default:
      return <p {...attributes}>{children}</p>;
    case "quote":
      return <blockquote {...attributes}>{children}</blockquote>;
    case "code":
      return (
        <pre>
          <code {...attributes}>{children}</code>
        </pre>
      );
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "heading-one":
      return <h1 {...attributes}>{children}</h1>;
    case "heading-two":
      return <h2 {...attributes}>{children}</h2>;
    case "heading-three":
      return <h3 {...attributes}>{children}</h3>;
    case "heading-four":
      return <h4 {...attributes}>{children}</h4>;
    case "heading-five":
      return <h5 {...attributes}>{children}</h5>;
    case "heading-six":
      return <h6 {...attributes}>{children}</h6>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>;
    case "link":
      return (
        <SafeLink href={element.url} {...attributes}>
          {children}
        </SafeLink>
      );
    case "image":
      return <ImageElement {...props} />;
  }
};
