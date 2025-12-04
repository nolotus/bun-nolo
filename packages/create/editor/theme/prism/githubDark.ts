// ./theme/prism/githubDark.ts

export const githubDark = `
/**
 * GitHub-like dark theme for Prism.js
 * 参考 GitHub Dark 代码配色
 */

code[class*="language-"],
pre[class*="language-"] {
  color: #c9d1d9;
  background: none;
  text-shadow: none;
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
  font-size: 1em;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  line-height: 1.5;

  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;

  -webkit-hyphens: none;
  -moz-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;
}

/* Code blocks */
pre[class*="language-"] {
  margin: .5em 0;
  padding: 1em;
  overflow: auto;
  border-radius: 6px;
  background: #0d1117;
  border: 1px solid #30363d;
}

/* Inline code */
:not(pre) > code[class*="language-"] {
  padding: .2em .4em;
  border-radius: 4px;
  background-color: rgba(110, 118, 129, 0.4);
  color: #e6edf3;
  white-space: normal;
}

/* Selection */
pre[class*="language-"] ::selection,
code[class*="language-"] ::selection {
  background: rgba(56, 139, 253, 0.4);
}

pre[class*="language-"]::-moz-selection,
code[class*="language-"]::-moz-selection {
  background: rgba(56, 139, 253, 0.4);
}

/* Tokens */

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: #8b949e;
}

.token.punctuation {
  color: #c9d1d9;
}

.namespace {
  opacity: .7;
}

.token.property,
.token.tag,
.token.constant,
.token.symbol,
.token.deleted {
  color: #ff7b72; /* 红/标签等 */
}

.token.boolean,
.token.number {
  color: #f2cc60; /* 黄/数值 */
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: #a5d6ff; /* 浅蓝/字符串 */
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
  color: #f0883e;
}

.token.atrule,
.token.attr-value,
.token.keyword {
  color: #ff7b72; /* 关键字红橙 */
}

.token.function,
.token.class-name {
  color: #d2a8ff; /* 紫 */
}

.token.regex,
.token.important,
.token.variable {
  color: #f2cc60; /* 黄 */
}

.token.important,
.token.bold {
  font-weight: bold;
}

.token.italic {
  font-style: italic;
}

.token.entity {
  cursor: help;
}
`;
