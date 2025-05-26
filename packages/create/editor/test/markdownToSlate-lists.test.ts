import { describe, expect, test } from "bun:test";
import { markdownToSlate } from "../markdownToSlate";

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
            children: [{ text: "First item" }],
          },
          {
            type: "list-item",
            value: 2,
            children: [{ text: "Second item" }],
          },
          {
            type: "list-item",
            value: 3,
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
        start: 1,
        children: [
          {
            type: "list-item",
            value: 1,
            children: [{ text: "First item" }],
          },
          {
            type: "list-item",
            value: 2,
            children: [{ text: "Second item" }],
          },
          {
            type: "list-item",
            value: 3,
            children: [{ text: "Third item" }],
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
            children: [{ text: "First item" }],
          },
          {
            type: "list-item",
            value: 4,
            children: [{ text: "Second item" }],
          },
          {
            type: "list-item",
            value: 5,
            children: [{ text: "Third item" }],
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
            children: [{ text: "Unchecked task" }],
          },
          {
            type: "list-item",
            value: 2,
            checked: true,
            children: [{ text: "Checked task" }],
          },
          {
            type: "list-item",
            value: 3,
            checked: true,
            children: [{ text: "Task with " }, { bold: true, text: "bold" }],
          },
          {
            type: "list-item",
            value: 4,
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
        start: 1,
        children: [
          {
            type: "list-item",
            value: 1,
            children: [{ text: "Regular item" }],
          },
          {
            type: "list-item",
            value: 2,
            checked: false,
            children: [{ text: "Unchecked task" }],
          },
          {
            type: "list-item",
            value: 3,
            children: [{ text: "Regular item 2" }],
          },
          {
            type: "list-item",
            value: 4,
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
        start: 1,
        children: [
          {
            type: "list-item",
            value: 1,
            children: [{ text: "Regular item" }],
          },
          {
            type: "list-item",
            value: 2,
            checked: false,
            children: [
              { text: "Unchecked task" },
              {
                type: "list",
                ordered: false,
                start: 1,
                children: [
                  {
                    type: "list-item",
                    value: 1,
                    children: [{ text: "Nested regular item" }],
                  },
                  {
                    type: "list-item",
                    value: 2,
                    checked: true,
                    children: [{ text: "Nested checked task" }],
                  },
                ],
              },
            ],
          },
          {
            type: "list-item",
            value: 3,
            children: [{ text: "Regular item 2" }],
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
            children: [{ text: "Ordered unchecked task" }],
          },
          {
            type: "list-item",
            value: 2,
            checked: true,
            children: [
              { text: "Ordered checked task" },
              {
                type: "list",
                ordered: false,
                start: 1,
                children: [
                  {
                    type: "list-item",
                    value: 1,
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
});
