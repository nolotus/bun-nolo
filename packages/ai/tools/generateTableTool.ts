import * as XLSX from "xlsx";

export const generateTableTool = {
  type: "function",
  function: {
    name: "generate_table",
    description: "根据提供的 JSON 数据生成 Excel 表格",
    parameters: {
      type: "object",
      properties: {
        data: {
          type: "array",
          description: "待生成表格的数据，每个数组元素代表一行数据（对象形式）",
          items: {
            type: "object",
          },
        },
        fileName: {
          type: "string",
          description:
            "生成的 Excel 文件名，可选，不提供则默认使用 output.xlsx",
        },
      },
      required: ["data"],
    },
  },
};

export const generateTable = (args, thunkApi, currentUserId) => {
  // 参数简单验证
  if (!Array.isArray(args.data)) {
    throw new Error("生成表格失败：参数 data 必须为数组");
  }
  // 如果没有传递文件名，则使用默认文件名 output.xlsx
  const fileName = args.fileName || "output.xlsx";

  try {
    // 利用 SheetJS 将 JSON 数据转换为工作表
    const worksheet = XLSX.utils.json_to_sheet(args.data);

    // 新建一个工作簿
    const workbook = XLSX.utils.book_new();

    // 将工作表添加到工作簿中，命名为 "Sheet1"
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // 生成并下载 Excel 文件
    XLSX.writeFile(workbook, fileName);

    return `生成表格成功：文件名为 ${fileName}`;
  } catch (error) {
    throw new Error(`生成表格失败：${error.message}`);
  }
};
