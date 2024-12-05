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
