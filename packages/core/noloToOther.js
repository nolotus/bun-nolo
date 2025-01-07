export const listToArray = (data) => {
  if (!data) return [];
  const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
  return data.split(regex).map((item) => {
    return item.replace(/^"|"$/g, "");
  });
};
