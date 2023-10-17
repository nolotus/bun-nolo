import React, {useSyncExternalStore} from 'react';
import {isBrowser} from 'utils/env'
import {readData} from 'database/client/read'

export let memCache = new Map();
let promiseCache = new Map();
let listeners = [];

export function fetchData(id) {
  if (!promiseCache.has(id)) {
    promiseCache.set(id, readData(id));
  }
  return promiseCache.get(id);
}

export function promiseHandle(promise) {
  if (promise.status === 'fulfilled') {
    return promise.value;
  } else if (promise.status === 'rejected') {
    throw promise.reason;
  } else if (promise.status === 'pending') {
    throw promise;
  } else {
    promise.status = 'pending';
    promise.then(
      result => {
        promise.status = 'fulfilled';
        promise.value = result;
      },
      reason => {
        promise.status = 'rejected';
        promise.reason = reason;
      },
    );
    throw promise;
  }
}

function getResult(id: string) {
  const result = promiseHandle(fetchData(id));
  if (result === null || result.error) {
    return '0';
  }
  return result;
}
export const useStore =(id)=>{
  function subscribe(listener) {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }
  
  const getSnapshot = React.useCallback(() => {
    const result = getResult(id);
  console.log('browser result',result)

    return result;
  }, [id]);
  
  const getServerSnapshot = React.useCallback(() => {
    if (!isBrowser) {
      const result = getResult(id);
    console.log('server result',id,result)
      memCache.set(id, result);
      return result
    }
    if (isBrowser) {
      const result = window.NOLO_STORE_DATA;
      console.log('browser init result',result)
      let value
      if(result.length>0){
         value = result.filter(item => item.id === id)[0].value;
      }
      return value
    }
  }, [id]);
  const  result = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return result;
}