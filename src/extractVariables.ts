import { strObjProps } from './Types';
import { getLessVariable } from './util';

const REGX_br = /\n/g; // 正则 换行符
const REGX_less_params = /@[a-zA-Z-_\d]+/g;

/**
 * 替换less 文件中的变量
 *   #1 找到 less 文件中定义的变量
 *   #2 抽离出只使用到预定义变量的行
 */
export const extractVariablesImpl = (
  str: string,
  variable: strObjProps
): string => {
  return (
    str
      .split(REGX_br)
      // line string
      .filter(ls => {
        if (
          ls.includes('{') ||
          ls.includes('}') ||
          ls.includes(',') ||
          ls.includes('.') ||
          ls.includes('&') ||
          ls.includes('>')
        ) {
          // 函数，class 声明
          return true;
        }

        if (ls.includes('@')) {
          // 判断是否使用了 预定的变量
          let is = ls.search(':'); // indicator start

          // line_less_variables_array
          const llva = [...ls.substring(is).matchAll(REGX_less_params)].map(i =>
            i[0].trim()
          );
          return llva.some(k => variable[k]);
        }
        return false;
      })
      .join('\n')
  );
};

/**
 *
 * @param str less 字符串
 * @param option
 * 根据预定义的变量抽离 less 结构
 *
 * @returns less 字符串
 */
export const extractVariables = (
  str: string,
  variable: strObjProps
): Promise<string> => {
  return Promise.resolve(getLessVariable(str)).then(fv => {
    // file variable
    if (typeof variable === 'object') {
      // merge variable
      const mv: strObjProps = {
        ...variable
      };

      for (const k in fv) {
        if (Object.prototype.hasOwnProperty.call(fv, k)) {
          const vk = fv[k].trim();
          if (mv[vk]) {
            mv[k] = vk;
          }
        }
      }

      return extractVariablesImpl(str, mv);
    }
    return str;
  });
};

export default extractVariables;
