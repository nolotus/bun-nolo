export const DATABASE_DIR = "./nolodata";
export const DEFAULT_INDEX_FILE = "index.nolo";

// export const
export const getDatabaseFilePath = (
  userId: string,
  type?: "index" | "hash"
) => {
  const indexPath = `./nolodata/${userId}/${DEFAULT_INDEX_FILE}`;
  if (type === "index") {
    return indexPath;
  }

  return { indexPath };
};
