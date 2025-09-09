// ========================================================================
// START: 这是完整的、已更新的测试文件内容
// ========================================================================

import { describe, expect, test } from "bun:test";
import { markdownToSlate } from "../transforms/markdownToSlate";

describe("markdownToSlate - lists", () => {
  test("should convert unordered list", () => {
    const markdown = `
- First item
- Second item
- Third item
    `;
    const expected = [
      {
        type: "list",
        ordered: false,
        start: 1,
        children: [
          {
            type: "list-item",
            value: 1,
            // 变化在这里：现在 children 是一个包含 paragraph 的数组
            children: [
              { type: "paragraph", children: [{ text: "First item" }] },
            ],
          },
          {
            type: "list-item",
            value: 2,
            children: [
              { type: "paragraph", children: [{ text: "Second item" }] },
            ],
          },
          {
            type: "list-item",
            value: 3,
            children: [
              { type: "paragraph", children: [{ text: "Third item" }] },
            ],
          },
        ],
      },
    ];
    expect(markdownToSlate(markdown)).toEqual(expected);
  });

  test("should convert ordered list", () => {
    const markdown = `
1. First item
2. Second item
3. Third item
    `;
    const expected = [
      {
        type: "list",
        ordered: true,
        start: 1,
        children: [
          {
            type: "list-item",
            value: 1,
            children: [
              { type: "paragraph", children: [{ text: "First item" }] },
            ],
          },
          {
            type: "list-item",
            value: 2,
            children: [
              { type: "paragraph", children: [{ text: "Second item" }] },
            ],
          },
          {
            type: "list-item",
            value: 3,
            children: [
              { type: "paragraph", children: [{ text: "Third item" }] },
            ],
          },
        ],
      },
    ];
    expect(markdownToSlate(markdown)).toEqual(expected);
  });

  test("should convert ordered list with custom start", () => {
    const markdown = `
3. First item
4. Second item
5. Third item
    `;
    const expected = [
      {
        type: "list",
        ordered: true,
        start: 3,
        children: [
          {
            type: "list-item",
            value: 3,
            children: [
              { type: "paragraph", children: [{ text: "First item" }] },
            ],
          },
          {
            type: "list-item",
            value: 4,
            children: [
              { type: "paragraph", children: [{ text: "Second item" }] },
            ],
          },
          {
            type: "list-item",
            value: 5,
            children: [
              { type: "paragraph", children: [{ text: "Third item" }] },
            ],
          },
        ],
      },
    ];
    expect(markdownToSlate(markdown)).toEqual(expected);
  });

  test("converts task lists", () => {
    const markdown = `
- [ ] Unchecked task
- [x] Checked task
- [x] Task with **bold**
- [ ] Task with ~~strike~~
`;
    expect(markdownToSlate(markdown)).toEqual([
      {
        type: "list",
        ordered: false,
        start: 1,
        children: [
          {
            type: "list-item",
            value: 1,
            checked: false,
            children: [
              { type: "paragraph", children: [{ text: "Unchecked task" }] },
            ],
          },
          {
            type: "list-item",
            value: 2,
            checked: true,
            children: [
              { type: "paragraph", children: [{ text: "Checked task" }] },
            ],
          },
          {
            type: "list-item",
            value: 3,
            checked: true,
            children: [
              {
                type: "paragraph",
                children: [
                  { text: "Task with " },
                  { bold: true, text: "bold" },
                ],
              },
            ],
          },
          {
            type: "list-item",
            value: 4,
            checked: false,
            children: [
              {
                type: "paragraph",
                children: [
                  { text: "Task with " },
                  { strikethrough: true, text: "strike" },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  test("converts mixed lists with tasks and regular items", () => {
    const markdown = `
- Regular item
- [ ] Unchecked task
- Regular item 2
- [x] Checked task with **bold**
`;
    expect(markdownToSlate(markdown)).toEqual([
      {
        type: "list",
        ordered: false,
        start: 1,
        children: [
          {
            type: "list-item",
            value: 1,
            children: [
              { type: "paragraph", children: [{ text: "Regular item" }] },
            ],
          },
          {
            type: "list-item",
            value: 2,
            checked: false,
            children: [
              { type: "paragraph", children: [{ text: "Unchecked task" }] },
            ],
          },
          {
            type: "list-item",
            value: 3,
            children: [
              { type: "paragraph", children: [{ text: "Regular item 2" }] },
            ],
          },
          {
            type: "list-item",
            value: 4,
            checked: true,
            children: [
              {
                type: "paragraph",
                children: [
                  { text: "Checked task with " },
                  { bold: true, text: "bold" },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  test("converts complex lists with tasks and nesting", () => {
    const markdown = `
- Regular item
- [ ] Unchecked task
  - Nested regular item
  - [x] Nested checked task
- Regular item 2
1. [ ] Ordered unchecked task
2. [x] Ordered checked task
   - [ ] Nested unchecked
`;
    expect(markdownToSlate(markdown)).toEqual([
      {
        type: "list",
        ordered: false,
        start: 1,
        children: [
          {
            type: "list-item",
            value: 1,
            children: [
              { type: "paragraph", children: [{ text: "Regular item" }] },
            ],
          },
          {
            type: "list-item",
            value: 2,
            checked: false,
            children: [
              { type: "paragraph", children: [{ text: "Unchecked task" }] },
              {
                type: "list",
                ordered: false,
                start: 1,
                children: [
                  {
                    type: "list-item",
                    value: 1,
                    children: [
                      {
                        type: "paragraph",
                        children: [{ text: "Nested regular item" }],
                      },
                    ],
                  },
                  {
                    type: "list-item",
                    value: 2,
                    checked: true,
                    children: [
                      {
                        type: "paragraph",
                        children: [{ text: "Nested checked task" }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "list-item",
            value: 3,
            children: [
              { type: "paragraph", children: [{ text: "Regular item 2" }] },
            ],
          },
        ],
      },
      {
        type: "list",
        ordered: true,
        start: 1,
        children: [
          {
            type: "list-item",
            value: 1,
            checked: false,
            children: [
              {
                type: "paragraph",
                children: [{ text: "Ordered unchecked task" }],
              },
            ],
          },
          {
            type: "list-item",
            value: 2,
            checked: true,
            children: [
              {
                type: "paragraph",
                children: [{ text: "Ordered checked task" }],
              },
              {
                type: "list",
                ordered: false,
                start: 1,
                children: [
                  {
                    type: "list-item",
                    value: 1,
                    checked: false,
                    children: [
                      {
                        type: "paragraph",
                        children: [{ text: "Nested unchecked" }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  // 这是我们新加的测试用例，它的结构已经是正确的，无需修改
  test("should correctly handle code blocks inside list items", () => {
    const markdown = `
- List item with a code block:
  \`\`\`javascript
  const x = 1;
  console.log(x);
  \`\`\`
- Another item.
    `;
    const expected = [
      {
        type: "list",
        ordered: false,
        start: 1,
        children: [
          {
            type: "list-item",
            value: 1,
            children: [
              {
                type: "paragraph",
                children: [{ text: "List item with a code block:" }],
              },
              {
                type: "code-block",
                language: "javascript",
                children: [
                  { type: "code-line", children: [{ text: "const x = 1;" }] },
                  {
                    type: "code-line",
                    children: [{ text: "console.log(x);" }],
                  },
                ],
              },
            ],
          },
          {
            type: "list-item",
            value: 2,
            children: [
              { type: "paragraph", children: [{ text: "Another item." }] },
            ],
          },
        ],
      },
    ];
    expect(markdownToSlate(markdown)).toEqual(expected);
  });
});

// ========================================================================
// END: 完整的、已更新的测试文件内容
// ========================================================================
