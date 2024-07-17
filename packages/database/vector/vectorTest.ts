import { getTextEmbedding } from "integrations/openAI/embedding";
// LSH 函数定义
function vectorToLSH(
  vector: number[],
  numBits: number,
  currentThreshold: number,
): { lshString: string; nextThreshold: number } {
  const bitsPerChunk: number = Math.floor(vector.length / numBits);
  const lshValue: number[] = new Array(numBits).fill(0);

  vector.forEach((value, index) => {
    lshValue[Math.floor(index / bitsPerChunk)] += value;
  });

  const lshString: string = lshValue
    .map((sum) => (sum / bitsPerChunk >= currentThreshold ? "1" : "0"))
    .join("");

  // 计算当前块的平均值来更新阈值
  const average: number =
    vector.reduce((acc, val) => acc + val, 0) / vector.length;
  // 使用移动平均来平滑变化
  const alpha: number = 0.7;
  const nextThreshold: number =
    currentThreshold * alpha + average * (1 - alpha);

  return {
    lshString: lshString,
    nextThreshold: nextThreshold,
  };
}

// 测试文本样本
const texts: string[] = [
  "I enjoy watching the beautiful sunsets by the beach.",
  "Watching the beautiful sunsets by the beach is enjoyable.",
  "The beach is a great place to relax and admire the sunset.",
  "Machine learning models can be trained to generate embeddings.",
  "Quantum computers have the potential to revolutionize computing.",
];

// 测试代码
let currentThreshold: number = 0; // 初始化阈值
texts.forEach((text) => {
  const vector = getTextEmbedding(text);
  const { lshString, nextThreshold } = vectorToLSH(
    vector,
    256,
    currentThreshold,
  );
  currentThreshold = nextThreshold;
});
