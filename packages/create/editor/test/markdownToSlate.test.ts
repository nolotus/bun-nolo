// markdownToSlate.test.ts

import { markdownToSlate } from "../markdownToSlate";
import { describe, test, expect } from "bun:test";

describe("markdownToSlate - paragraphs and headings", () => {
  test("should convert h1", () => {
    const markdown = "# Hello World";
    expect(markdownToSlate(markdown)).toEqual([
      {
        type: "heading-one",
        children: [{ text: "Hello World" }],
      },
    ]);
  });

  test("should convert h2", () => {
    const markdown = "## Hello World";
    expect(markdownToSlate(markdown)).toEqual([
      {
        type: "heading-two",
        children: [{ text: "Hello World" }],
      },
    ]);
  });

  test("should convert multiple headings", () => {
    const markdown = "# Title\n## Subtitle";
    expect(markdownToSlate(markdown)).toEqual([
      {
        type: "heading-one",
        children: [{ text: "Title" }],
      },
      {
        type: "heading-two",
        children: [{ text: "Subtitle" }],
      },
    ]);
  });
  test("should handle empty string", () => {
    const markdown = "";
    expect(markdownToSlate(markdown)).toBeNull();
  });
  test("should convert all heading levels (h1-h6)", () => {
    const markdown = "# h1\n## h2\n### h3\n#### h4\n##### h5\n###### h6";
    expect(markdownToSlate(markdown)).toEqual([
      {
        type: "heading-one",
        children: [{ text: "h1" }],
      },
      {
        type: "heading-two",
        children: [{ text: "h2" }],
      },
      {
        type: "heading-three",
        children: [{ text: "h3" }],
      },
      {
        type: "heading-four",
        children: [{ text: "h4" }],
      },
      {
        type: "heading-five",
        children: [{ text: "h5" }],
      },
      {
        type: "heading-six",
        children: [{ text: "h6" }],
      },
    ]);
  });

  test("should convert single paragraph", () => {
    const markdown = "Hello World";
    // 调试输出

    expect(markdownToSlate(markdown)).toEqual([
      {
        type: "paragraph",
        children: [{ text: "Hello World" }],
      },
    ]);
  });

  test("should convert multiple paragraphs", () => {
    const markdown = "First paragraph\n\nSecond paragraph";
    // 调试输出

    expect(markdownToSlate(markdown)).toEqual([
      {
        type: "paragraph",
        children: [{ text: "First paragraph" }],
      },
      {
        type: "paragraph",
        children: [{ text: "Second paragraph" }],
      },
    ]);
  });

  test("should convert mixed headings and paragraphs", () => {
    const markdown =
      "# Title\nFirst paragraph\n\n## Subtitle\nSecond paragraph";
    // 调试输出

    expect(markdownToSlate(markdown)).toEqual([
      {
        type: "heading-one",
        children: [{ text: "Title" }],
      },
      {
        type: "paragraph",
        children: [{ text: "First paragraph" }],
      },
      {
        type: "heading-two",
        children: [{ text: "Subtitle" }],
      },
      {
        type: "paragraph",
        children: [{ text: "Second paragraph" }],
      },
    ]);
  });
});
describe("markdownToSlate - inline styles", () => {
  test("should convert bold text", () => {
    const markdown = "**Bold text**";

    expect(markdownToSlate(markdown)).toEqual([
      {
        type: "paragraph",
        children: [
          {
            text: "Bold text",
            bold: true,
          },
        ],
      },
    ]);
  });

  test("should convert italic text", () => {
    const markdown = "*Italic text*";

    expect(markdownToSlate(markdown)).toEqual([
      {
        type: "paragraph",
        children: [
          {
            text: "Italic text",
            italic: true,
          },
        ],
      },
    ]);
  });

  test("should convert mixed inline styles", () => {
    const markdown = "Normal text with **bold** and *italic* words";

    expect(markdownToSlate(markdown)).toEqual([
      {
        type: "paragraph",
        children: [
          {
            text: "Normal text with ",
          },
          {
            text: "bold",
            bold: true,
          },
          {
            text: " and ",
          },
          {
            text: "italic",
            italic: true,
          },
          {
            text: " words",
          },
        ],
      },
    ]);
  });

  test("should convert inline styles in headings", () => {
    const markdown = "# Heading with **bold** text";

    expect(markdownToSlate(markdown)).toEqual([
      {
        type: "heading-one",
        children: [
          {
            text: "Heading with ",
          },
          {
            text: "bold",
            bold: true,
          },
          {
            text: " text",
          },
        ],
      },
    ]);
  });
});

describe("markdownToSlate", () => {
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
        children: [
          {
            type: "list-item",
            children: [{ text: "First item" }],
          },
          {
            type: "list-item",
            children: [{ text: "Second item" }],
          },
          {
            type: "list-item",
            children: [{ text: "Third item" }],
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
        children: [
          {
            type: "list-item",
            children: [{ text: "First item" }],
          },
          {
            type: "list-item",
            children: [{ text: "Second item" }],
          },
          {
            type: "list-item",
            children: [{ text: "Third item" }],
          },
        ],
      },
    ];

    expect(markdownToSlate(markdown)).toEqual(expected);
  });
});
describe("markdownToSlate - links", () => {
  test("should convert simple links", () => {
    const markdown = "This is a [link](https://example.com)";

    const expected = [
      {
        type: "paragraph",
        children: [
          { text: "This is a " },
          {
            type: "link",
            url: "https://example.com",
            children: [{ text: "link" }],
          },
        ],
      },
    ];

    expect(markdownToSlate(markdown)).toEqual(expected);
  });

  test("should convert links with formatted text", () => {
    const markdown = "Check this [**bold link**](https://example.com)";

    const expected = [
      {
        type: "paragraph",
        children: [
          { text: "Check this " },
          {
            type: "link",
            url: "https://example.com",
            children: [{ text: "bold link", bold: true }],
          },
        ],
      },
    ];

    expect(markdownToSlate(markdown)).toEqual(expected);
  });
});
describe("markdownToSlate - code", () => {
  test("should convert inline code", () => {
    const markdown = "Use the `console.log()` function";

    const expected = [
      {
        type: "paragraph",
        children: [
          { text: "Use the " },
          { type: "code-inline", children: [{ text: "console.log()" }] },
          { text: " function" },
        ],
      },
    ];

    expect(markdownToSlate(markdown)).toEqual(expected);
  });

  test("should convert code blocks", () => {
    const markdown = "```javascript\nconst x = 1;\nconsole.log(x);\n```";

    const expected = [
      {
        type: "code-block",
        language: "javascript",
        children: [
          {
            type: "code-line",
            children: [{ text: "const x = 1;" }],
          },
          {
            type: "code-line",
            children: [{ text: "console.log(x);" }],
          },
        ],
      },
    ];

    expect(markdownToSlate(markdown)).toEqual(expected);
  });

  test("should handle various code block types", () => {
    const markdown = `
  \`\`\`tsx
  const Component = () => {
    return <div>Hello</div>;
  }
  \`\`\`
  
  \`\`\`yaml
  name: workflow
  on: 
    push:
      branches: main
  \`\`\`
  
  \`\`\`json
  {
    "name": "test",
    "version": "1.0.0"
  }
  \`\`\`
  `;

    const expected = [
      {
        type: "code-block",
        language: "tsx",
        children: [
          {
            type: "code-line",
            children: [{ text: "const Component = () => {" }],
          },
          {
            type: "code-line",
            children: [{ text: "  return <div>Hello</div>;" }],
          },
          {
            type: "code-line",
            children: [{ text: "}" }],
          },
        ],
      },
      {
        type: "code-block",
        language: "yaml",
        children: [
          {
            type: "code-line",
            children: [{ text: "name: workflow" }],
          },
          {
            type: "code-line",
            children: [{ text: "on: " }],
          },
          {
            type: "code-line",
            children: [{ text: "  push:" }],
          },
          {
            type: "code-line",
            children: [{ text: "    branches: main" }],
          },
        ],
      },
      {
        type: "code-block",
        language: "json",
        children: [
          {
            type: "code-line",
            children: [{ text: "{" }],
          },
          {
            type: "code-line",
            children: [{ text: '  "name": "test",' }],
          },
          {
            type: "code-line",
            children: [{ text: '  "version": "1.0.0"' }],
          },
          {
            type: "code-line",
            children: [{ text: "}" }],
          },
        ],
      },
    ];

    expect(markdownToSlate(markdown)).toEqual(expected);
  });
});

describe("markdownToSlate - images", () => {
  test("should convert simple image", () => {
    const markdown = "![alt text](https://example.com/image.jpg)";

    const expected = [
      {
        type: "paragraph",
        children: [
          {
            type: "image",
            url: "https://example.com/image.jpg",
            alt: "alt text",
            children: [{ text: "" }],
          },
        ],
      },
    ];

    expect(markdownToSlate(markdown)).toEqual(expected);
  });

  test("should convert image with title", () => {
    const markdown = '![alt text](https://example.com/image.jpg "image title")';

    const expected = [
      {
        type: "paragraph",
        children: [
          {
            type: "image",
            url: "https://example.com/image.jpg",
            alt: "alt text",
            title: "image title",
            children: [{ text: "" }],
          },
        ],
      },
    ];

    expect(markdownToSlate(markdown)).toEqual(expected);
  });

  test("should convert image in paragraph with text", () => {
    const markdown =
      "Here is an image: ![alt text](https://example.com/image.jpg)";

    const expected = [
      {
        type: "paragraph",
        children: [
          { text: "Here is an image: " },
          {
            type: "image",
            url: "https://example.com/image.jpg",
            alt: "alt text",
            children: [{ text: "" }],
          },
        ],
      },
    ];

    expect(markdownToSlate(markdown)).toEqual(expected);
  });
});
test("converts markdown table to slate nodes", () => {
  const markdown = `
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
| Cell 3   | **Bold** |
  `;

  const result = markdownToSlate(markdown);
  expect(result[0]).toEqual({
    type: "table",
    children: [
      {
        type: "table-row",
        children: [
          {
            type: "table-cell",
            header: true,
            children: [{ text: "Header 1" }],
          },
          {
            type: "table-cell",
            header: true,
            children: [{ text: "Header 2" }],
          },
        ],
      },
      {
        type: "table-row",
        children: [
          {
            type: "table-cell",
            children: [{ text: "Cell 1" }],
          },
          {
            type: "table-cell",
            children: [{ text: "Cell 2" }],
          },
        ],
      },
      {
        type: "table-row",
        children: [
          {
            type: "table-cell",
            children: [{ text: "Cell 3" }],
          },
          {
            type: "table-cell",
            children: [{ bold: true, text: "Bold" }],
          },
        ],
      },
    ],
  });
});
test("converts strikethrough text", () => {
  // 基本删除线
  const markdown1 = "~~struck through~~";
  expect(markdownToSlate(markdown1)).toEqual([
    {
      type: "paragraph",
      children: [
        {
          strikethrough: true,
          text: "struck through",
        },
      ],
    },
  ]);

  // 删除线与其他样式组合
  const markdown2 = "~~struck **bold** through~~";
  expect(markdownToSlate(markdown2)).toEqual([
    {
      type: "paragraph",
      children: [
        { strikethrough: true, text: "struck " },
        { strikethrough: true, bold: true, text: "bold" },
        { strikethrough: true, text: " through" },
      ],
    },
  ]);

  // 删除线在列表项中
  const markdown3 = "- Item with ~~struck through~~";
  expect(markdownToSlate(markdown3)).toEqual([
    {
      type: "list",
      ordered: false,
      children: [
        {
          type: "list-item",
          children: [
            { text: "Item with " },
            { strikethrough: true, text: "struck through" },
          ],
        },
      ],
    },
  ]);
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
      children: [
        {
          type: "list-item",
          checked: false,
          children: [{ text: "Unchecked task" }],
        },
        {
          type: "list-item",
          checked: true,
          children: [{ text: "Checked task" }],
        },
        {
          type: "list-item",
          checked: true,
          children: [{ text: "Task with " }, { bold: true, text: "bold" }],
        },
        {
          type: "list-item",
          checked: false,
          children: [
            { text: "Task with " },
            { strikethrough: true, text: "strike" },
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
      children: [
        {
          type: "list-item",
          children: [{ text: "Regular item" }],
        },
        {
          type: "list-item",
          checked: false,
          children: [{ text: "Unchecked task" }],
        },
        {
          type: "list-item",
          children: [{ text: "Regular item 2" }],
        },
        {
          type: "list-item",
          checked: true,
          children: [
            { text: "Checked task with " },
            { bold: true, text: "bold" },
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
      children: [
        {
          type: "list-item",
          children: [{ text: "Regular item" }],
        },
        {
          type: "list-item",
          checked: false,
          children: [
            { text: "Unchecked task" },
            {
              type: "list",
              ordered: false,
              children: [
                {
                  type: "list-item",
                  children: [{ text: "Nested regular item" }],
                },
                {
                  type: "list-item",
                  checked: true,
                  children: [{ text: "Nested checked task" }],
                },
              ],
            },
          ],
        },
        {
          type: "list-item",
          children: [{ text: "Regular item 2" }],
        },
      ],
    },
    {
      type: "list",
      ordered: true,
      children: [
        {
          type: "list-item",
          checked: false,
          children: [{ text: "Ordered unchecked task" }],
        },
        {
          type: "list-item",
          checked: true,
          children: [
            { text: "Ordered checked task" },
            {
              type: "list",
              ordered: false,
              children: [
                {
                  type: "list-item",
                  checked: false,
                  children: [{ text: "Nested unchecked" }],
                },
              ],
            },
          ],
        },
      ],
    },
  ]);
});
test("converts horizontal rules", () => {
  // 使用显式的 \n 而不是模板字符串的换行
  const markdown =
    "First paragraph\n\n---\n\nSecond paragraph\n\n***\n\nThird paragraph\n\n___";

  expect(markdownToSlate(markdown)).toEqual([
    {
      type: "paragraph",
      children: [{ text: "First paragraph" }],
    },
    {
      type: "thematic-break",
      children: [{ text: "" }],
    },
    {
      type: "paragraph",
      children: [{ text: "Second paragraph" }],
    },
    {
      type: "thematic-break",
      children: [{ text: "" }],
    },
    {
      type: "paragraph",
      children: [{ text: "Third paragraph" }],
    },
    {
      type: "thematic-break",
      children: [{ text: "" }],
    },
  ]);
});
test("converts horizontal rules", () => {
  const markdown = `First paragraph

---

Second paragraph

***

Third paragraph

___
`;
});

test("converts horizontal rules in various contexts", () => {
  const markdown = `Some text with **bold**

---

> A quote

***

- List item

___

\`\`\`
code block
\`\`\`

---
`;
  // ... rest of the test
});
test("converts HTML elements", () => {
  const markdown = `
Some text with <span class="highlight">inline HTML</span>.

<div class="custom">
  <p>Block HTML</p>
</div>

Paragraph with <br/> line break.
`;

  expect(markdownToSlate(markdown)).toEqual([
    {
      type: "paragraph",
      children: [
        { text: "Some text with " },
        {
          type: "html-inline",
          html: '<span class="highlight">inline HTML</span>',
          children: [{ text: "inline HTML" }],
        },
        { text: "." },
      ],
    },
    {
      type: "html-block",
      html: '<div class="custom">\n  <p>Block HTML</p>\n</div>',
      children: [{ text: "" }],
    },
    {
      type: "paragraph",
      children: [
        { text: "Paragraph with " },
        {
          type: "html-inline",
          html: "<br/>",
          children: [{ text: "" }],
        },
        { text: " line break." },
      ],
    },
  ]);
});
test("converts complex HTML scenarios", () => {
  const markdown = `
Before <custom-element data-attr="value">inline element</custom-element> after.

<div class="wrapper">
  <h1>Custom Title</h1>
  <p>With <em>mixed</em> content</p>
</div>

Regular paragraph with <span style="color: red">styled</span> and <br/> mixed content.

\`\`\`html
<div>This is code, not HTML block</div>
\`\`\`
`;

  expect(markdownToSlate(markdown)).toEqual([
    {
      type: "paragraph",
      children: [
        { text: "Before " },
        {
          type: "html-inline",
          html: '<custom-element data-attr="value">inline element</custom-element>',
          children: [{ text: "inline element" }],
        },
        { text: " after." },
      ],
    },
    {
      type: "html-block",
      html: '<div class="wrapper">\n  <h1>Custom Title</h1>\n  <p>With <em>mixed</em> content</p>\n</div>',
      children: [{ text: "" }],
    },
    {
      type: "paragraph",
      children: [
        { text: "Regular paragraph with " },
        {
          type: "html-inline",
          html: '<span style="color: red">styled</span>',
          children: [{ text: "styled" }],
        },
        { text: " and " },
        {
          type: "html-inline",
          html: "<br/>",
          children: [{ text: "" }],
        },
        { text: " mixed content." },
      ],
    },
    {
      type: "code-block",
      language: "html",
      children: [
        {
          type: "code-line",
          children: [{ text: "<div>This is code, not HTML block</div>" }],
        },
      ],
    },
  ]);
});
describe("markdownToSlate - blockquotes", () => {
  const logTestCase = (
    name: string,
    markdown: string,
    expected: any,
    actual: any,
  ) => {
    console.log(`\n=== Test Case: ${name} ===`);
    console.log("Markdown Input:");
    console.log(markdown);
    console.log("\nExpected Output:");
    console.log(JSON.stringify(expected, null, 2));
    console.log("\nActual Output:");
    console.log(JSON.stringify(actual, null, 2));
    console.log("=====================\n");
  };

  test("should convert simple blockquote", () => {
    const markdown = "> This is a quote";
    const expected = [
      {
        type: "quote",
        children: [
          {
            type: "paragraph",
            children: [{ text: "This is a quote" }],
          },
        ],
      },
    ];
    const actual = markdownToSlate(markdown);
    expect(actual).toEqual(expected);
  });

  test("should convert blockquote with formatted text", () => {
    const markdown = "> This is a **bold** and *italic* quote";
    const expected = [
      {
        type: "quote",
        children: [
          {
            type: "paragraph",
            children: [
              { text: "This is a " },
              { text: "bold", bold: true },
              { text: " and " },
              { text: "italic", italic: true },
              { text: " quote" },
            ],
          },
        ],
      },
    ];
    const actual = markdownToSlate(markdown);
    expect(actual).toEqual(expected);
  });

  test("should convert nested blockquotes", () => {
    const markdown = "> Outer quote\n>> Inner quote";
    const expected = [
      {
        type: "quote",
        children: [
          {
            type: "paragraph",
            children: [{ text: "Outer quote" }],
          },
          {
            type: "quote",
            children: [
              {
                type: "paragraph",
                children: [{ text: "Inner quote" }],
              },
            ],
          },
        ],
      },
    ];
    const actual = markdownToSlate(markdown);
    expect(actual).toEqual(expected);
  });
});
