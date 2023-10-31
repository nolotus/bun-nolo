// const dict = require('./dict.js');
const pinyinMap = new Map([
  ['型', 'xing'],
  ['号', 'hao'],
  ['库', 'ku'],
  ['存', 'cun'],
  ['封', 'feng'],
  ['装', 'zhuang'],
  ['批', 'pi'],
  ['次', 'ci'],
  ['厂', 'chang'],
  ['商', 'shang'],
  ['说', 'shuo'],
  ['明', 'ming'],
  ['位', 'wei'],
]);

export function getPinyin(str) {
  let result = '';

  for (const char of str) {
    if (pinyinMap.has(char)) {
      result += pinyinMap.get(char);
    } else {
      result += char;
    }
  }

  return result;
}
