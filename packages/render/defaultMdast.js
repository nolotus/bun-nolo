// defaultMdast.js
const defaultMdast = {
  type: 'root',
  children: [
    {
      type: 'heading',
      depth: 1,
      children: [
        {
          type: 'text',
          value: 'Markdown 编辑器指南',
        },
      ],
    },
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: '本指南提供了Markdown编辑器的基本使用示例。',
        },
      ],
    },
    {
      type: 'heading',
      depth: 2,
      children: [
        {
          type: 'text',
          value: '文本格式',
        },
      ],
    },
    {
      type: 'paragraph',
      children: [
        {
          type: 'strong',
          children: [
            {
              type: 'text',
              value: '粗体',
            },
          ],
        },
        {
          type: 'text',
          value: ' 和 ',
        },
        {
          type: 'emphasis',
          children: [
            {
              type: 'text',
              value: '斜体',
            },
          ],
        },
        {
          type: 'text',
          value: ' 以及 ',
        },
        {
          type: 'delete',
          children: [
            {
              type: 'text',
              value: '删除线',
            },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      children: [
        {
          type: 'link',
          url: 'https://example.com',
          children: [
            {
              type: 'text',
              value: '这是一个链接',
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      depth: 2,
      children: [
        {
          type: 'text',
          value: '列表和任务',
        },
      ],
    },
    {
      type: 'list',
      ordered: false,
      children: [
        {
          type: 'listItem',
          checked: null,
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value: '无序列表项',
                },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          checked: true,
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value: '已完成的任务列表项',
                },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          checked: false,
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value: '未完成的任务列表项',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      depth: 2,
      children: [
        {
          type: 'text',
          value: '表格',
        },
      ],
    },
    {
      type: 'table',
      align: [null, 'center', 'right'],
      children: [
        {
          type: 'tableRow',
          children: [
            {
              type: 'tableCell',
              children: [
                {
                  type: 'text',
                  value: '头部 1',
                },
              ],
            },
            {
              type: 'tableCell',
              children: [
                {
                  type: 'text',
                  value: '头部 2',
                },
              ],
            },
            {
              type: 'tableCell',
              children: [
                {
                  type: 'text',
                  value: '头部 3',
                },
              ],
            },
          ],
        },
        {
          type: 'tableRow',
          children: [
            {
              type: 'tableCell',
              children: [
                {
                  type: 'text',
                  value: '列 1, 项 1',
                },
              ],
            },
            {
              type: 'tableCell',
              children: [
                {
                  type: 'text',
                  value: '列 2, 项 2',
                },
              ],
            },
            {
              type: 'tableCell',
              children: [
                {
                  type: 'text',
                  value: '列 3, 项 3',
                },
              ],
            },
          ],
        },
        // 更多行可以添加到这里
      ],
    },
    {
      type: 'heading',
      depth: 2,
      children: [
        {
          type: 'text',
          value: '代码',
        },
      ],
    },
    {
      type: 'code',
      lang: 'javascript',
      value: '// 这是一段JavaScript代码\nconsole.log("Hello, Markdown!");',
    },
    // 你可以继续添加更多的Markdown元素
  ],
};

export default defaultMdast;
