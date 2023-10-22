
import {extractAndDecodePrefix} from 'core/prefix';
import {noloToObject,getHeadTail} from 'core';
import {readLines} from 'utils/bun/readLines'

import {QueryCondition, QueryOptions} from './types';
import {evaluateCondition} from './operators';

const handleData = (
  data: string,
  condition: QueryCondition,
  flags: any,
  isObject: boolean,
  isJSON: boolean,
  isList: boolean,
) => {
  if (flags.isList && isList) {
    return handleListData(data, condition);
  }
  if (flags.isJSON && isJSON) {
    return handleJSONData(data, condition);
  }
  if (flags.isObject && isObject) {
    return handleObjectData(data, condition);
  }
  return null;
};

export const queryData = async (options: QueryOptions): Promise<Array<any>> => {
  const {
    userId,
    condition,
    isObject = false,
    isJSON = false,
    isList = false,
    skip = 0,
    limit = 10,
    sort,
  } = options;

  try {
    const path = `./nolodata/${userId}/index.nolo`;
    const file = Bun.file(path);
    const stream = file.stream();
  
    const results: any[] = [];
    let count = 0;
  
    // 利用我们先前定义的 readLines 函数
    let reader = readLines(stream);
    try {
      for await (let line of reader) {
          const {key: dataKey, value: data} = getHeadTail(line);
          const flags = extractAndDecodePrefix(dataKey);
          const result = handleData(
              data,
              condition || {},
              flags,
              isObject,
              isJSON,
              isList,
          );
          if (result) {
            if (count >= skip && results.length < limit) {
              results.push({id: dataKey, ...result});
            }
            count++;
          }
          
  
      }
    } catch (err) {
        console.error(err);
    }
  
    // 如果有排序条件，进行排序
    if (sort) {
      results.sort((a, b) => {
        if (sort.order === 'asc') {
          return a[sort.key] > b[sort.key] ? 1 : -1;
        } else {
          return a[sort.key] < b[sort.key] ? 1 : -1;
        }
      });
    }
  
    return results;
  } catch(e) {
    console.error('出错了:', e);
  }


};

function handleObjectData(data: string, condition: QueryCondition) {
  const objectData = noloToObject(data);
  if (evaluateCondition(condition, objectData)) {
    return objectData;
  }
  return null;
}

function handleJSONData(data: string, condition: QueryCondition) {
  try {
    const jsonData = JSON.parse(data);
    if (evaluateCondition(condition, jsonData)) {
      return jsonData;
    }
  } catch (error) {
    console.error('JSON parsing failed:', error); // 打印错误信息
  }
  return null;
}

function handleListData(data: string, condition: QueryCondition) {
  // 处理列表数据的逻辑
  console.log('data', data, condition);
  return null;
}

// 其他代码保持不变
