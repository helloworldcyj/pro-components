import React from 'react';
import type { SearchTransformKeyFn } from '../typing';
import get from 'rc-util/lib/utils/get';
import namePathSet from 'rc-util/lib/utils/set';
import isNil from '../isNil';

export type DataFormatMapType = Record<string, SearchTransformKeyFn | undefined>;

const transformKeySubmitValue = <T = any>(
  values: T,
  dataFormatMapRaw: Record<string, SearchTransformKeyFn | undefined>,
) => {
  // ignore nil transfrom
  const dataFormatMap = Object.keys(dataFormatMapRaw).reduce((ret, key) => {
    const value = dataFormatMapRaw[key];
    if (!isNil(value)) {
      // eslint-disable-next-line no-param-reassign
      ret[key] = value!; // can't be undefined
    }
    return ret;
  }, {} as Record<string, SearchTransformKeyFn>);

  if (Object.keys(dataFormatMap).length < 1) {
    return values;
  }
  // 如果 value 是 string | null | Blob类型 其中之一，直接返回
  // 形如 {key: [File, File]} 的表单字段当进行第二次递归时会导致其直接越过 typeof value !== 'object' 这一判断 https://github.com/ant-design/pro-components/issues/2071
  if (typeof values !== 'object' || isNil(values) || values instanceof Blob) {
    return values;
  }
  let finalValues = {} as T;

  const gen = (tempValues: T, parentsKey?: React.Key) => {
    let result = {} as T;
    if (tempValues == null || tempValues === undefined) {
      return result;
    }
    Object.keys(tempValues).forEach((entryKey) => {
      const key = parentsKey ? [parentsKey, entryKey] : [entryKey];
      const itemValue = tempValues[entryKey];
      if (
        typeof itemValue === 'object' &&
        !Array.isArray(itemValue) &&
        !React.isValidElement(itemValue) && // ignore walk throungh React Element
        !(itemValue instanceof Blob) // ignore walk throungh Blob
      ) {
        const genValues = gen(itemValue, entryKey);
        if (Object.keys(genValues).length < 1) {
          return;
        }
        result = namePathSet(result, [entryKey], genValues);
        return;
      }
      const transformFunction = get(dataFormatMap, key);
      const tempKey =
        typeof transformFunction === 'function'
          ? transformFunction?.(itemValue, entryKey, tempValues)
          : entryKey;
      // { [key:string]:any } 数组也能通过编译
      if (Array.isArray(tempKey)) {
        result = namePathSet(result, tempKey, itemValue);
        return;
      }
      if (typeof tempKey === 'object') {
        finalValues = {
          ...finalValues,
          ...tempKey,
        };
      } else if (tempKey) {
        result = namePathSet(result, [tempKey], itemValue);
      }
    });
    return result;
  };
  finalValues = {
    ...gen(values),
    ...finalValues,
  };

  return finalValues;
};

export default transformKeySubmitValue;
