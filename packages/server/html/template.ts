// src/server/html/template.js

/**
 * 生成包含完整SEO优化的HTML文档起始部分。
 * @param {object} seo - SEO相关的属性
 * @param {string} seo.lang - 页面语言 (e.g., "zh-CN", "en")
 * @param {string} seo.title - 页面标题
 * @param {string} seo.description - 页面描述
 * @param {string} bootstrapCss - Bootstrap CSS文件的路径。
 * @returns {string} HTML字符串。
 */
export const htmlStart = ({ lang, title, description }, bootstrapCss) => `
  <!DOCTYPE html>
  <html lang="${lang}">
  <head>
    <meta charSet="UTF-8" />
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="description" content="${description}" />
    <meta name="keywords" content="AI, Agent, 自定义Agent, 智能助理, AI聊天, 代码生成, 文件上传, nolo, nolo.chat" />
    <meta name="author" content="Nolo.Chat Team" />
    <link rel="canonical" href="https://nolo.chat" />

    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="https://nolo.chat" />
    <meta property="og:site_name" content="Nolo.Chat" />
    <meta property="og:image" content="https://nolo.chat/og-image.png" />
    <meta property="og:type" content="website" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="https://nolo.chat/og-image.png" />
    
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Nolo.Chat",
        "applicationCategory": "ProductivityApplication",
        "operatingSystem": "Web",
        "description": "${description}",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "creator": {
          "@type": "Organization",
          "name": "Nolo.Chat",
          "url": "https://nolo.chat"
        }
      }
    </script>
    
    <link rel="stylesheet" href="${bootstrapCss}">
    <script>
      function $U(h, s) {
        document.getElementById(h)?.remove();
        document.getElementById(h.replace('ST', 'SR'))?.remove();
      }
    </script>
  </head>
  <body>
`;

export const htmlEnd = `
  </body>
</html>
`;
