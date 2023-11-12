export const getTokensFromLocalStorage = () => {
  const storedTokens = window.localStorage.getItem('tokens');

  if (!storedTokens) {
    return [];
  }

  try {
    const parsedTokens = JSON.parse(storedTokens);
    return Array.isArray(parsedTokens) ? parsedTokens : [parsedTokens];
  } catch (e) {
    // 对于不合法的 JSON 或者其它情况，当做单个token处理
    return [storedTokens];
  }
};

export const storeTokens = (newToken) => {
  let tokens = getTokensFromLocalStorage();
  tokens = tokens.filter((token) => token !== newToken);
  tokens.unshift(newToken);
  window.localStorage.setItem('tokens', JSON.stringify(tokens));
};
export const removeToken = (token_to_remove) => {
  const tokens = getTokensFromLocalStorage().filter(
    (token) => token !== token_to_remove,
  );
  window.localStorage.setItem('tokens', JSON.stringify(tokens));
};

export const retrieveFirstToken = () => {
  const tokens = getTokensFromLocalStorage();
  return tokens.length ? tokens[0] : null;
};
