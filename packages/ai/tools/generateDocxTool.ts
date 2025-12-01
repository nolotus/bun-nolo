// /ai/tools/generateDocxTool.ts

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

/**
 * LLM 用的 schema：告诉它有哪些参数可以传
 * 约定：模板里的占位符使用 [[name]] 这种形式，而不是 {{name}}
 */
export const generateDocxFunctionSchema = {
  name: "generateDocx",
  description:
    "在浏览器中根据指定的 DOCX 模板 URL 和变量，生成并下载一个新的 DOCX 文档。模板占位符使用 [[name]] 语法。",
  parameters: {
    type: "object",
    properties: {
      templateUrl: {
        type: "string",
        description: "DOCX 模板文件的 URL，例如 /templates/contract.docx。",
      },
      fileName: {
        type: "string",
        description: "生成文档的文件名（不含 .docx 后缀，可选，默认：文档）。",
      },
      variables: {
        type: "object",
        description:
          "用于替换模板占位符的键值对，例如 { contract_no: 'PO2501', product_name: '中号转盘款拼图板' }。",
        additionalProperties: true,
      },
    },
    required: ["templateUrl"],
  },
};

/**
 * 在前端用 docxtemplater 生成 docx 并触发浏览器下载
 * 模板中请使用 [[variable_name]] 作为占位符，避免和已有的 {{ }} 冲突
 */
export async function generateDocxFunc(
  args: {
    templateUrl: string;
    fileName?: string;
    variables?: Record<string, any>;
  },
  _thunkApi: any
): Promise<{ rawData: object; displayData: string }> {
  const templateUrl = args.templateUrl?.trim();
  if (!templateUrl) {
    throw new Error("生成文档失败：templateUrl 不能为空。");
  }

  const fileName = (args.fileName?.trim() || "文档") + ".docx";
  const variables = args.variables || {};

  try {
    // 1. 拉取模板
    const res = await fetch(templateUrl);
    if (!res.ok) {
      throw new Error(`无法加载模板：${templateUrl}`);
    }
    const arrayBuffer = await res.arrayBuffer();

    // 2. 用 PizZip 打开 docx
    const zip = new PizZip(new Uint8Array(arrayBuffer));

    // 3. 创建 docxtemplater 实例
    // 这里显式改用 [[ ]] 作为分隔符，避免解析到历史留下的 {{ }} 残骸
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: "[[",
        end: "]]",
      },
    });

    // 4. 设置数据并渲染
    doc.setData(variables);

    try {
      doc.render();
    } catch (e: any) {
      // 打印更详细的错误信息，方便调试模板
      console.error("docxtemplater 渲染错误:", e);
      if (e?.properties?.errors) {
        e.properties.errors.forEach((err: any) =>
          console.error("template error:", err)
        );
      }
      throw new Error("模板渲染失败，请检查占位符和 variables 是否匹配。");
    }

    // 5. 生成 Blob 并触发浏览器下载
    const blob = doc.getZip().generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // 6. 返回给 LLM / 前端展示的信息
    const rawData = {
      success: true,
      fileName,
      persisted: false, // 仅本地下载，未持久化到服务端
    };
    const displayData = `文档《${fileName}》已生成并开始下载。`;

    return { rawData, displayData };
  } catch (error: any) {
    const msg = error?.message || JSON.stringify(error) || "未知错误";
    throw new Error(`生成文档时出错: ${msg}`);
  }
}
