// render/elements/SafeLink.tsx (更新后)

import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";

/**
 * 分析链接字符串，判断其类型并返回相应信息。
 * @param {string | undefined} rawHref - 原始 href 属性。
 * @returns {{href: string, isExternal: boolean}} - 包含处理后的 href 和一个布尔值，指示是否为外部链接。
 */
const getLinkInfo = (
  rawHref: string | undefined
): { href: string; isExternal: boolean } => {
  // 1. 处理无效输入，返回一个安全的、无害的外部链接。
  if (!rawHref || typeof rawHref !== "string") {
    return { href: "about:blank", isExternal: true };
  }

  const href = rawHref.trim();

  // 2. 检查明确的外部链接协议。
  if (/^(https?:|mailto:|tel:)/i.test(href)) {
    return { href, isExternal: true };
  }

  // 3. 检查协议相对链接 (e.g., //google.com)，这也是外部链接。
  if (href.startsWith("//")) {
    return { href, isExternal: true };
  }

  // 4. 检查是否看起来像一个域名但没有协议 (e.g., "google.com", "www.baidu.com")。
  //    规则：包含"."，不包含空格，且不以"/"开头。
  if (href.includes(".") && !href.includes(" ") && !href.startsWith("/")) {
    // 自动为其添加协议相对前缀，并视为外部链接。
    return { href: `//${href}`, isExternal: true };
  }

  // 5. 如果以上都不是，则认为是内部链接 (e.g., "/dashboard", "about", "#section-id")。
  return { href, isExternal: false };
};

export const SafeLink = ({ attributes, children, href, ...props }) => {
  // 使用 useMemo 对链接信息进行计算和缓存，仅在 href 变化时重新计算。
  const linkInfo = useMemo(() => getLinkInfo(href), [href]);

  if (linkInfo.isExternal) {
    // --- 外部链接渲染 ---
    // 使用标准的 <a> 标签
    // target="_blank" 在新标签页打开
    // rel="noopener noreferrer" 是出于安全考虑，防止新页面访问原始页面对象。
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
  } else {
    // --- 内部链接渲染 ---
    // 使用 NavLink (或 Link) 来处理客户端路由，实现无刷新跳转。
    return (
      <NavLink to={linkInfo.href} {...attributes} {...props}>
        {children}
      </NavLink>
    );
  }
};
