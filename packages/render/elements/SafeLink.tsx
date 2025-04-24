import React, { useMemo } from "react";
import { NavLink } from "react-router-dom"; // 或者 import { Link } from "react-router-dom";

const allowedSchemes = ["http:", "https:", "mailto:", "tel:"];

export const SafeLink = ({ attributes, children, href, ...props }) => {
  const safeHref = useMemo(() => {
    let parsedUrl = null;
    try {
      // 尝试解析 href，相对路径会基于当前域名
      parsedUrl = new URL(href, window.location.origin);
      // eslint-disable-next-line no-empty
    } catch {}
    if (parsedUrl && allowedSchemes.includes(parsedUrl.protocol)) {
      return parsedUrl.href;
    }
    return "about:blank";
  }, [href]);

  // 如果 href 是相对路径或站内链接，使用 NavLink 处理路由
  // 如果是外部链接或 about:blank，使用普通的 <a> 标签
  if (
    safeHref === "about:blank" ||
    safeHref.startsWith("http") ||
    safeHref.startsWith("mailto") ||
    safeHref.startsWith("tel")
  ) {
    return (
      <a href={safeHref} {...attributes}>
        {children}
      </a>
    );
  } else {
    return (
      <NavLink to={href} {...attributes} {...props}>
        {children}
      </NavLink>
    );
  }
};
