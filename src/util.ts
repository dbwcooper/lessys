import fs from 'fs-extra';
import path from 'path';
import less from 'less';
import { strObjProps } from './Types';

const REGX_line = /\n/g; // 换行符
const REGX_variables = /;/g;

/**
 * 删除未使用到变量的行
 */
export const removeConstantLine = (str: string) => {
  return str
    .split(REGX_line)
    .filter((item) => {
      return (
        item.includes('@') ||
        item.includes('{') ||
        item.includes('}') ||
        item.includes(',') ||
        item.includes('.') ||
        item.includes('&') ||
        item.includes('>')
      );
    })
    .join('\n');
};

/**
 * 
 * @param {str} str less string
 * @input 
    // @breakpoint: 1600px;
    @table-bg-error: #ffd3c1;
   @output 
    @table-bg-error: #ffd3c1;
 */
export const removeComments = (str: string): string => {
  const REGX_token_start_array_1 = /\/\//g;
  const REGX_token_end_array_1 = /\n/g;
  const REGX_token_start_array_2 = /\/\*/g;
  const REGX_token_end_array_2 = /\*\//g;

  let tsa1 = [...str.matchAll(REGX_token_start_array_1)].map(
    (item) => item.index
  ); // [80, 82, 84, 131, 181];
  let tsa2 = [...str.matchAll(REGX_token_start_array_2)].map(
    (item) => item.index
  ); // [134, 430];
  let tea1 = [...str.matchAll(REGX_token_end_array_1)].map(
    (item) => item.index
  ); // [36, 37, 79, 130, 179, 180, 242];
  let tea2 = [...str.matchAll(REGX_token_end_array_2)].map(
    (item) => item.index
  ); // [485];

  const comments = [];
  while (tsa1.length > 0 || tsa2.length > 0) {
    // 判断是 // 还是 /*
    let tType = 'tsa1';
    tsa1[0] < tsa2[0] ? 'tsa1' : 'tsa2';
    if (tsa1.length === 0 || tsa2[0] < tsa1[0]) {
      tType = 'tsa2';
    }
    // 找到 一段注释的 起点到终点。
    let tsi = 0;
    let tei = 0;
    if (tType === 'tsa1') {
      tsi = tsa1[0];
      tei = tea1.filter((i) => i > tsi)[0];
    } else {
      tsi = tsa2[0];
      tei = tea2.filter((i) => i > tsi)[0];
    }
    comments.unshift([tsi, tei, tType]);

    // 重置 数组
    tsa1 = tsa1.filter((i) => i > tei);
    tsa2 = tsa2.filter((i) => i > tei);
    tea1 = tea1.filter((i) => i > tei);
    tea2 = tea2.filter((i) => i > tei);
  }

  // 删除 str 中的注释
  if (comments.length > 0) {
    comments.forEach((arr) => {
      let si = arr[0];
      let ei = arr[1];
      let tType = arr[2];

      if (typeof si === 'number' && typeof ei === 'number') {
        si = tType === 'tsa2' ? si : si - 1;
        ei = tType === 'tsa2' ? ei + 2 : ei;
        str = str.substring(0, si) + str.substring(ei);
      }
    });
  }
  return str;
};

/**
 * @param lessPath less 文件路径
 * @returns string
 */
export const getFileUTF8 = async (lessPath: string) =>
  fs.readFile(lessPath, 'utf8');

/**
 *
 * @param str less 字符串
 * @returns {
 *   '@primary-color': '#fff'
 * }
 */
export const getLessVariable = (str: string): strObjProps => {
  return removeComments(str)
    .split(REGX_variables)
    .reduce((prev: strObjProps = {}, current) => {
      if (current.includes(':')) {
        let variable = current.split(':')[0].trim();
        let variv = current.split(':')[1];
        // 去掉此类情况： @{ant-preix}-button: { }
        if (
          variable.includes('@{') ||
          variable.includes('{') ||
          variable.includes('//') ||
          variable.includes('&') ||
          variable.indexOf('@') === -1
        ) {
          return prev;
        }
        if (variable && typeof variable === 'string') {
          prev[variable] = variv;
        }
      }
      return prev;
    }, {});
};

// @import './xxx' => @import 'E:/xxx'
// 将less 文件中的相对路径转换为 绝对路径
export const transferAbsolutePath = (lessStr: string, dir: string): string => {
  // 找到 @import './Default.less' 行
  let regx1 = /@import\s?\S*;/g;
  let regx2 = /[\'|\"]/g;

  // ['../theme/Default.less']
  const pathArr = [...lessStr.matchAll(regx1)].map((item) => {
    let lineStr = item[0];
    let startIndex = [...lineStr.matchAll(regx2)][0].index + 1;
    let endIndex = [...lineStr.matchAll(regx2)][1].index;
    return lineStr.substring(startIndex, endIndex);
  });

  const transferPathArr = pathArr.map((item) => {
    if (!path.isAbsolute(item)) {
      // return path.resolve(dir, item)
      return path.resolve(dir, item).replace(/\\/g, '/');
    }
    return item;
  });

  transferPathArr.forEach((newPath, index) => {
    let oldPath = pathArr[index];
    lessStr = lessStr.replace(oldPath, newPath);
  });

  return lessStr;
};

export const lessToCss = async (lessInputStr: string): Promise<string> => {
  return less
    .render(lessInputStr)
    .then((output) => output.css.replace(/:global ?/g, ''))
    .then(removeComments)
    .catch((e) => {
      console.log(e);
      return '';
    });
};
