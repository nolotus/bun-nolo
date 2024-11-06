export const noloToObject = (text) => {
  if (text === "") {
    return {};
  }
  // console.log("text type ", typeof text);
  // console.log("text", text);

  const array = text.split(/,(?=(?:[^']*'[^']*')*[^']*$)/g);
  const object = array.reduce((acc, cur) => {
    const indexOfColon = cur.indexOf(":");
    const head = cur.slice(0, indexOfColon);
    const tail = cur.slice(indexOfColon + 1);
    if (tail.startsWith("'") && tail.endsWith("'")) {
      // remove the leading and trailing single quote
      acc[head] = tail.slice(1, -1);
    } else {
      acc[head] = tail;
    }
    return acc;
  }, {});
  return object;
};

export const listToArray = (data) => {
  if (!data) return [];
  const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
  return data.split(regex).map((item) => {
    return item.replace(/^"|"$/g, "");
  });
};
