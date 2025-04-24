// 文件路径: ai/tools/generateImageTool.ts

export const generateImageTool = {
  type: "function",
  function: {
    name: "generate_image",
    description: "根据提示生成图片",
    parameters: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "生成图片的提示词，描述你想要生成的图片内容",
        },
        sampleCount: {
          type: "number",
          description: "生成图片的数量，默认为1",
          default: 1,
        },
      },
      required: ["prompt"],
    },
  },
};

/**
 * 调用Google Imagen API生成图片
 * @param args 工具参数
 * @param thunkApi Redux Thunk API
 * @param currentUserId 当前用户ID
 * @returns 图片数据或链接
 */
export const generateImage = async (args, thunkApi, currentUserId) => {
  if (!args.prompt) {
    throw new Error("生成图片失败：提示词不能为空");
  }

  const sampleCount = args.sampleCount || 1;
  const apiKey = process.env.GEMINI_API_KEY || "你的API_KEY"; // 请确保从环境变量中读取API密钥

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: args.prompt,
            },
          ],
          parameters: {
            sampleCount: sampleCount,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    // 假设API返回的图片数据在 result.predictions 中，具体格式需要根据实际API响应调整
    const images = result.predictions || [];

    if (images.length === 0) {
      throw new Error("生成图片失败：未返回图片数据");
    }

    // 返回图片数据或链接
    return {
      type: "image",
      images: images.map((img: any) => ({
        url: img.imageUrl || "图片链接", // 替换为实际返回的图片URL字段
        caption: args.prompt,
      })),
    };
  } catch (error) {
    throw new Error(`生成图片失败：${error.message}`);
  }
};
