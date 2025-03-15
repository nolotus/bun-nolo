// 简单文件复制迁移
import fs from "fs";
import path from "path";

const OLD_DB_PATH = path.resolve(process.cwd(), "../../nolodata/nolodb");
const NEW_DB_PATH = path.join(process.cwd(), "data", "leveldb");

function copyDir(src, dest) {
  // 确保目标目录存在
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // 读取源目录
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // 递归复制子目录
      copyDir(srcPath, destPath);
    } else {
      // 复制文件
      fs.copyFileSync(srcPath, destPath);
      console.log(`复制: ${srcPath} -> ${destPath}`);
    }
  }
}

console.log("开始复制数据库文件...");
console.log(`从: ${OLD_DB_PATH}`);
console.log(`到: ${NEW_DB_PATH}`);

try {
  copyDir(OLD_DB_PATH, NEW_DB_PATH);
  console.log("数据库文件复制完成");
  console.log("请设置环境变量 USE_NEW_DB_PATH=true 来使用新数据库");
} catch (err) {
  console.error("复制失败:", err);
  process.exit(1);
}
