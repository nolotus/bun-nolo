async function getIndexValues<TValue>(
  store: IDBObjectStore<unknown, TValue>,
  indexName: string,
  range?: IDBKeyRange | IDBKeyRange[] | null,
  order: "asc" | "desc" = "asc",
): Promise<TValue[]> {
  const index = store.index(indexName);
  const direction = order === "asc" ? "next" : "prev";
  const results: TValue[] = [];

  const request = index.openCursor(range, direction);

  request.onsuccess = () => {
    const cursor = request.result;
    if (cursor) {
      results.push(cursor.value);
      cursor.continue();
    }
  };

  request.onerror = () => {
    console.error("Error getting index cursor:", request.error);
  };

  await new Promise<void>((resolve) => {
    request.oncomplete = () => {
      resolve();
    };
  });

  return results;
}
