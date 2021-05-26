import { strObjProps } from './Types';
import expandFunction from './expandFunction';

import { getLessVariable } from './util';

const REGX_space = /\s/g; // 正则 空格
const REGX_br = /\n/g; // 正则 换行符
const REGX_less_params = /@[a-zA-Z-_\d]+/g;

/**
 * 替换less 文件中的变量
 *   #1 找到 less 文件中定义的变量
 *   #2 抽离出只使用到预定义变量的行
 */
export const extractLessImpl = (str: string, variable: strObjProps): string => {
  return str
    .split(REGX_br)
    .filter(lineStr => {
      if (
        lineStr.includes('{') ||
        lineStr.includes('}') ||
        lineStr.includes(',') ||
        lineStr.includes('.') ||
        lineStr.includes('&') ||
        lineStr.includes('>')
      ) {
        // 函数，class 声明
        return true;
      }

      if (lineStr.includes('@')) {
        // 判断是否使用了 预定的变量
        let indicator_start = lineStr.search(':');

        const line_less_variables_array = [
          ...lineStr.substring(indicator_start).matchAll(REGX_less_params)
        ].map(i => i[0].trim());
        return line_less_variables_array.some(k => variable[k]);
      }
      return false;
    })
    .join('\n');
};

/**
 *
 * @param str less 字符串
 * @param option
 * 根据预定义的变量抽离 less 结构
 *
 * @returns less 字符串
 */
export const extractLess = (
  str: string,
  variable: strObjProps
): Promise<string> => {
  return Promise.resolve(getLessVariable(str)).then(file_variable => {
    if (typeof variable === 'object') {
      const merge_variable: strObjProps = {
        ...variable
      };

      for (const key in file_variable) {
        if (Object.prototype.hasOwnProperty.call(file_variable, key)) {
          const v_key = file_variable[key].trim();
          if (merge_variable[v_key]) {
            merge_variable[key] = v_key;
          }
        }
      }

      return extractLessImpl(str, merge_variable);
    }
    return str;
  });
};

export default extractLess;
