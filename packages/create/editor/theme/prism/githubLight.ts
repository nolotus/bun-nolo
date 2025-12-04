// ./theme/prism/githubLight.ts

export const githubLight = `
/**
 * GitHub-like light theme for Prism.js
 * 参考 GitHub 代码配色（浅色）
 */

code[class*="language-"],
pre[class*="language-"] {
  color: #24292e;
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
  background: #f6f8fa;
  border: 1px solid #d0d7de;
}

/* Inline code */
:not(pre) > code[class*="language-"] {
  padding: .2em .4em;
  border-radius: 4px;
  background-color: rgba(175, 184, 193, 0.2);
  color: #24292f;
  white-space: normal;
}

/* Selection */
pre[class*="language-"] ::selection,
code[class*="language-"] ::selection {
  background: rgba(180, 213, 255, 0.7);
}

pre[class*="language-"]::-moz-selection,
code[class*="language-"]::-moz-selection {
  background: rgba(180, 213, 255, 0.7);
}

/* Tokens */

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
 : #6a737d;
}

.token.punctuation {
  color: #24292e;
}

.namespace {
  opacity: .7;
}

.token.property,
.token.tag,
.token.constant,
.token.symbol,
.token.deleted {
  color: #d73a49; /* 红 */
}

.token.boolean,
.token.number {
  color: #005cc5; /* 蓝 */
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: #032f62; /* 深蓝/字符串 */
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
  color: #d73a49;
}

.token.atrule,
.token.attr-value,
.token.keyword {
  color: #d73a49;
}

.token.function,
.token.class-name {
  color: #6f42c1; /* 紫色函数/类名 */
}

.token.regex,
.token.important,
.token.variable {
  color: #e36209; /* 橙色 */
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
