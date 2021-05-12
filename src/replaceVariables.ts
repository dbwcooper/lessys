import { strObjProps, funcVariableProps } from './Types';

/**
 * 无法处理引用文件
 */
const REGX_line = /\n/g; // 换行符
const REGX_space = /\s/g; // 正则 空格
const REGX_less_params = /@[a-zA-Z-_\d]+/g;
const REGX_func_params_replace = /[\(\),]/g; // 匹配函 .setSelection(@height, @color);

/**
 *
 * @param str
 * @param func_index
 * @returns [@color, @height, small]
 */
export const findFuncParams = (str: string, func_index: number) => {
  const start_index = str.substring(func_index).search(/\(/g) + func_index;
  let left_braces = [];
  let right_braces = [];

  const params_end = [...str.substring(start_index).matchAll(/[\(\)]/g)].find(
    item => {
      if (item[0] === '(') {
        left_braces.push(item.index);
      }
      if (item[0] === ')') {
        right_braces.push(item.index);
      }
      return (
        left_braces.length !== 0 && left_braces.length === right_braces.length
      );
    }
  );
  return str
    .substr(start_index, params_end.index)
    .replace(REGX_space, '')
    .split(REGX_func_params_replace)
    .filter(item => item);
};

/**
 * @param str less file string
 * @param func_variables obj
      {
        func_used_array: [
          { func_name: '.getTagHeight', func_index: 1332 },
          { func_name: '.setSelection', func_index: 1910 },
          { func_name: '.setSelection', func_index: 2022 }
        ],
        func_defined: {
          '.setSelection': {
            func_index: 328,
            params: ['@size'],
            content: 'xx'
          }
        }
      }
  @returns str
 */
export const replaceFuncParams = (
  str: string,
  func_params_mapping: strObjProps
) => {
  let replacedStr = str;
  /**
   * 替换函数变量
   * [@color, @height, small]
   * [@primary-color-1, @padding-lg]
   */

  if (Object.keys(func_params_mapping).length > 0) {
    const arr = [...str.matchAll(REGX_less_params)].reverse();
    arr.forEach(p => {
      let key = p[0];
      let index = p.index;
      let length = key.length;

      if (func_params_mapping[key]) {
        replacedStr =
          replacedStr.substring(0, index) +
          func_params_mapping[key] +
          replacedStr.substring(index + length);
      }
    });
  }
  return replacedStr;
};

// #1 以 ; 分割
// #2 replace 时， {} 符号保留。
export const replaceVariables = (str: string, variables_obj: strObjProps) => {
  let replacedStr = str;
  replacedStr = replacedStr
    .split(REGX_line) // 拆成多行
    .map(line => {
      let reg = /[.,{}~]/;
      if (reg.test(line)) {
        return line;
      }

      let start_index = line.indexOf(':') > 0 ? line.indexOf(':') : 0;

      if (start_index > 0) {
        let param_str = line.substring(start_index);
        const arr = [...param_str.matchAll(REGX_less_params)].filter(
          item => variables_obj[item[0]]
        );
        line = arr.length > 0 ? line : '';
      }
      return line;
    })
    .join('\n');

  return replacedStr.replace(/;+/g, ';');
};
