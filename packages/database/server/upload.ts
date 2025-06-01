// database/server/upload.ts
import { Request } from "bun";
import serverDb from "./db"; // 导入 LevelDB 实例
import path from "path";
import { ulid } from "ulid"; // 使用 ulid 生成唯一ID
import { mkdir } from "node:fs/promises"; // 用于创建目录，因为 Bun 暂未提供原生 API

// 文件存储路径
const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

/**
 * 确保上传目录存在
 */
async function ensureUploadDirExists(): Promise<void> {
  const dirExists = await Bun.file(UPLOAD_DIR).exists();
  if (!dirExists) {
    await mkdir(UPLOAD_DIR, { recursive: true }); // 使用 node:fs 的 mkdir，因为 Bun 暂未提供原生 API
  }
}

/**
 * 检查请求方法是否为 POST
 * @param method 请求方法
 * @returns 是否为 POST 方法
 */
function validateRequestMethod(method: string): Response | null {
  if (method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }
  return null;
}

/**
 * 从请求中提取文件
 * @param req 请求对象
 * @returns 文件对象或错误响应
 */
async function extractFileFromRequest(req: Request): Promise<File | Response> {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return new Response(JSON.stringify({ error: "No file uploaded" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  return file;
}

/**
 * 生成唯一文件ID和文件名
 * @param originalFileName 原始文件名
 * @returns 文件ID和文件名
 */
function generateFileIdAndName(originalFileName: string): {
  fileId: string;
  fileName: string;
} {
  const fileId = ulid();
  const fileExtension = path.extname(originalFileName);
  const fileName = `${fileId}${fileExtension}`;
  return { fileId, fileName };
}

/**
 * 计算文件的 SHA256 校验值（基于原始文件内容）
 * @param buffer 文件的 Buffer 数据
 * @returns SHA256 校验值（十六进制字符串）
 */
function calculateSha256(buffer: Buffer): string {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(buffer);
  return hasher.digest("hex"); // 以十六进制字符串返回
}

/**
 * 保存内容到文件系统
 * @param filePath 文件路径
 * @param content 文件内容（Buffer）
 */
async function saveContentToFileSystem(
  filePath: string,
  content: Buffer
): Promise<number> {
  return await Bun.write(filePath, content); // 使用 Bun.write 写入文件
}

/**
 * 创建文件元数据
 * @param fileId 文件ID
 * @param originalName 原始文件名
 * @param fileName 生成的文件名
 * @param filePath 文件路径
 * @param size 文件大小
 * @param type 文件类型
 * @param sha256 SHA256 校验值
 * @returns 文件元数据对象
 */
function createFileMetadata(
  fileId: string,
  originalName: string,
  fileName: string,
  filePath: string,
  size: number,
  type: string,
  sha256: string
): Record<string, any> {
  return {
    id: fileId,
    originalName: originalName,
    fileName: fileName,
    filePath: filePath,
    size: size,
    type: type || "unknown",
    sha256: sha256, // 存储原始文件的 SHA256 校验值
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * 保存文件元数据到 LevelDB
 * @param fileId 文件ID
 * @param metadata 文件元数据
 */
async function saveMetadataToDb(
  fileId: string,
  metadata: Record<string, any>
): Promise<void> {
  await serverDb.put(`file:${fileId}`, metadata);
}

/**
 * 创建成功响应
 * @param fileId 文件ID
 * @param metadata 文件元数据
 * @returns 成功响应对象
 */
function createSuccessResponse(
  fileId: string,
  metadata: Record<string, any>
): Response {
  return new Response(
    JSON.stringify({
      message: "File uploaded successfully",
      fileId: fileId,
      metadata: metadata,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

/**
 * 创建错误响应
 * @param errorMessage 错误信息
 * @param status 状态码
 * @returns 错误响应对象
 */
function createErrorResponse(errorMessage: string, status: number): Response {
  return new Response(
    JSON.stringify({
      error: "Failed to upload file",
      details: errorMessage,
    }),
    { status: status, headers: { "Content-Type": "application/json" } }
  );
}

/**
 * 处理文件上传请求
 * @param req 请求对象
 * @returns 上传结果
 */
export async function handleUpload(req: Request): Promise<Response> {
  try {
    // 确保上传目录存在
    await ensureUploadDirExists();

    // 检查请求方法
    const methodValidation = validateRequestMethod(req.method);
    if (methodValidation) return methodValidation;

    // 提取文件
    const fileResult = await extractFileFromRequest(req);
    if (fileResult instanceof Response) return fileResult;
    const file = fileResult;

    // 生成文件ID和文件名
    const { fileId, fileName } = generateFileIdAndName(file.name);
    const filePath = path.join(UPLOAD_DIR, fileName);

    // 读取文件内容并计算 SHA256 校验值
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const sha256 = calculateSha256(fileBuffer);

    // 保存原始内容到文件系统（不加密）
    await saveContentToFileSystem(filePath, fileBuffer);

    // 创建并保存文件元数据
    const fileMetadata = createFileMetadata(
      fileId,
      file.name,
      fileName,
      filePath,
      file.size,
      file.type,
      sha256
    );
    await saveMetadataToDb(fileId, fileMetadata);

    // 返回成功响应
    return createSuccessResponse(fileId, fileMetadata);
  } catch (error) {
    console.error("File upload error:", error);
    return createErrorResponse(error.message || "Unknown error", 500);
  }
}
