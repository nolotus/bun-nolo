interface InputMessage {
  content: Array<{
    text?: string;
    type: string;
    image_url?: {
      url: string;
    };
  }>;
  role: string;
}

interface OutputMessage {
  role: string;
  content: string;
  images: string[];
}

interface InputMessage {
  content: Array<{
    text?: string;
    type: string;
    image_url?: {
      url: string;
    };
  }>;
  role: string;
}

interface OutputMessage {
  role: string;
  content: string;
  images: string[];
}

export function transformMessages(inputs: InputMessage[]): OutputMessage[] {
  return inputs.map((input) => {
    const textContent =
      input.content.find((item) => item.type === "text")?.text || "";
    const imageUrls = input.content
      .filter((item) => item.type === "image_url")
      .map((item) => {
        const url = item.image_url!.url;
        // 检查 URL 是否以 "data:" 开头
        if (url.startsWith("data:")) {
          // 如果是，提取 base64 部分
          const base64Data = url.split(",")[1];
          return base64Data;
        }
        // 如果不是 data URL，返回原始 URL
        return url;
      });

    return {
      role: input.role,
      content: textContent,
      images: imageUrls,
    };
  });
}
