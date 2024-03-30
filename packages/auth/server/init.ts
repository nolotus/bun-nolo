export const DATABASE_DIR = "./nolodata";
export const DEFAULT_INDEX_FILE = "index.nolo";
export const DEFAULT_HASH_FILE = "hash.nolo";
export const DEFAULT_CUSTOM__FILE = "custom.nolo";
export const DEFAULT_NANOID__FILE = "nanoid.nolo";

// export const
export const getDatabaseFilePath = (
  userId: string,
  type?: "index" | "hash",
) => {
  const indexPath = `./nolodata/${userId}/${DEFAULT_INDEX_FILE}`;
  const hashPath = `./nolodata/${userId}/${DEFAULT_HASH_FILE}`;
  if (type === "index") {
    return indexPath;
  }
  if (type === "hash") {
    return hashPath;
  }
  return { indexPath, hashPath };
};
