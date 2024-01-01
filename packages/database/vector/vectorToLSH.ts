function vectorToLSH(vector: number[], numBits: number, currentThreshold: number): { lshString: string, nextThreshold: number } {
    const bitsPerChunk: number = Math.floor(vector.length / numBits);
    const lshValue: number[] = new Array(numBits).fill(0);

    vector.forEach((value, index) => {
        lshValue[Math.floor(index / bitsPerChunk)] += value;
    });

    const lshString: string = lshValue.map(sum => (sum / bitsPerChunk) >= currentThreshold ? '1' : '0').join('');

    // 计算当前块的平均值来更新阈值
    const average: number = lshValue.reduce((acc, val) => acc + val, 0) / lshValue.length;
    // 使用移动平均来平滑变化，这里我们给currentThreshold权重为0.7，给average权重0.3
    const alpha: number = 0.7;
    const nextThreshold: number = currentThreshold * alpha + average * (1 - alpha);

    return {
        lshString: lshString,
        nextThreshold: nextThreshold
    };
}

// 使用方法，假设初始值从数据库获取
let currentThreshold: number = 0; // 从数据库获取初始阈值
const vector: number[] = [...]; // 当前的向量

const result = vectorToLSH(vector, 256, currentThreshold);
// result.lshString 是当前向量的 LSH 值
// result.nextThreshold 是需要保存到数据库的新阈值

// 将新阈值保存回数据库
// saveThresholdToDatabase(result.nextThreshold);