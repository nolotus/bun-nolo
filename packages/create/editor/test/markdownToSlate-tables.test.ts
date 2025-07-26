import { describe, expect, test } from "bun:test";
// 导入我们统一的转换函数入口
import { markdownToSlate } from "../transforms/markdownToSlate";

describe("markdownToSlate - Tables", () => {
  test("should convert a basic table with various alignments", () => {
    const markdown = `
| Left Align | Center Align | Right Align |
| :--- | :---: | ---: |
| a | b | c |
`;
    const expected = [
      {
        type: "table",
        columns: [
          { align: "left", width: null },
          { align: "center", width: null },
          { align: "right", width: null },
        ],
        children: [
          {
            type: "table-row",
            children: [
              {
                type: "table-cell",
                header: true,
                children: [
                  { type: "paragraph", children: [{ text: "Left Align" }] },
                ],
              },
              {
                type: "table-cell",
                header: true,
                children: [
                  { type: "paragraph", children: [{ text: "Center Align" }] },
                ],
              },
              {
                type: "table-cell",
                header: true,
                children: [
                  { type: "paragraph", children: [{ text: "Right Align" }] },
                ],
              },
            ],
          },
          {
            type: "table-row",
            children: [
              {
                type: "table-cell",
                children: [{ type: "paragraph", children: [{ text: "a" }] }],
              },
              {
                type: "table-cell",
                children: [{ type: "paragraph", children: [{ text: "b" }] }],
              },
              {
                type: "table-cell",
                children: [{ type: "paragraph", children: [{ text: "c" }] }],
              },
            ],
          },
        ],
      },
    ];

    expect(markdownToSlate(markdown)).toEqual(expected);
  });

  test("should correctly handle tables with irregular row lengths by normalizing them", () => {
    // 这个测试用例是新方案健壮性的核心证明
    const markdown = `
| Header 1 | Header 2 | Header 3 |
|---|---|---|
| Row 1, Cell 1 | Row 1, Cell 2 |
| Row 2, Cell 1 |
`;
    const expected = [
      {
        type: "table",
        columns: [
          // 应该有 3 列
          { align: "left", width: null },
          { align: "left", width: null },
          { align: "left", width: null },
        ],
        children: [
          // Header Row
          {
            type: "table-row",
            children: [
              {
                type: "table-cell",
                header: true,
                children: [
                  { type: "paragraph", children: [{ text: "Header 1" }] },
                ],
              },
              {
                type: "table-cell",
                header: true,
                children: [
                  { type: "paragraph", children: [{ text: "Header 2" }] },
                ],
              },
              {
                type: "table-cell",
                header: true,
                children: [
                  { type: "paragraph", children: [{ text: "Header 3" }] },
                ],
              },
            ],
          },
          // Row 1 (应被补齐)
          {
            type: "table-row",
            children: [
              {
                type: "table-cell",
                children: [
                  { type: "paragraph", children: [{ text: "Row 1, Cell 1" }] },
                ],
              },
              {
                type: "table-cell",
                children: [
                  { type: "paragraph", children: [{ text: "Row 1, Cell 2" }] },
                ],
              },
              // 自动补齐的空单元格
              {
                type: "table-cell",
                children: [{ type: "paragraph", children: [{ text: "" }] }],
              },
            ],
          },
          // Row 2 (应被补齐)
          {
            type: "table-row",
            children: [
              {
                type: "table-cell",
                children: [
                  { type: "paragraph", children: [{ text: "Row 2, Cell 1" }] },
                ],
              },
              // 自动补齐的空单元格
              {
                type: "table-cell",
                children: [{ type: "paragraph", children: [{ text: "" }] }],
              },
              {
                type: "table-cell",
                children: [{ type: "paragraph", children: [{ text: "" }] }],
              },
            ],
          },
        ],
      },
    ];

    expect(markdownToSlate(markdown)).toEqual(expected);
  });

  test("should convert a table with complex inline content in cells", () => {
    const markdown = `
| Property | Description |
|---|---|
| Content | Cell with **bold**, *italic*, \`code\`, and a [link](https://example.com). |
`;
    const expected = [
      {
        type: "table",
        columns: [
          { align: "left", width: null },
          { align: "left", width: null },
        ],
        children: [
          {
            type: "table-row",
            children: [
              {
                type: "table-cell",
                header: true,
                children: [
                  { type: "paragraph", children: [{ text: "Property" }] },
                ],
              },
              {
                type: "table-cell",
                header: true,
                children: [
                  { type: "paragraph", children: [{ text: "Description" }] },
                ],
              },
            ],
          },
          {
            type: "table-row",
            children: [
              {
                type: "table-cell",
                children: [
                  { type: "paragraph", children: [{ text: "Content" }] },
                ],
              },
              {
                type: "table-cell",
                children: [
                  {
                    type: "paragraph",
                    children: [
                      { text: "Cell with " },
                      { text: "bold", bold: true },
                      { text: ", " },
                      { text: "italic", italic: true },
                      { text: ", " },
                      { type: "code-inline", children: [{ text: "code" }] },
                      { text: ", and a " },
                      {
                        type: "link",
                        url: "https://example.com",
                        children: [{ text: "link" }],
                      },
                      { text: "." },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    expect(markdownToSlate(markdown)).toEqual(expected);
  });

  test("should default to left-align if no alignment markers are specified", () => {
    const markdown = `
| Header 1 | Header 2 |
|---|---|
| Cell 1 | Cell 2 |
`;
    const result = markdownToSlate(markdown);
    // 只检查 columns 属性，因为 children 结构与基础测试类似
    expect(result[0].columns).toEqual([
      { align: "left", width: null },
      { align: "left", width: null },
    ]);
  });

  test("should handle a table with only a header row", () => {
    const markdown = `
| Header 1 | Header 2 |
|---|---|
`;
    const expected = [
      {
        type: "table",
        columns: [
          { align: "left", width: null },
          { align: "left", width: null },
        ],
        children: [
          {
            type: "table-row",
            children: [
              {
                type: "table-cell",
                header: true,
                children: [
                  { type: "paragraph", children: [{ text: "Header 1" }] },
                ],
              },
              {
                type: "table-cell",
                header: true,
                children: [
                  { type: "paragraph", children: [{ text: "Header 2" }] },
                ],
              },
            ],
          },
        ],
      },
    ];

    expect(markdownToSlate(markdown)).toEqual(expected);
  });
});
