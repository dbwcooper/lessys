import fs from 'fs-extra';
import { getLessVariable, getLessVariableFunc } from './storeVariables';
import {
  lessThemeObjProps,
  lessVariablesObjProps,
  listenLessPathObjProps,
  strObjProps,
  funcVariableProps
} from './Types';

import { formatLessString, getLessString } from './util';
import { replaceVariables } from './replaceVariables';

/**
 * less 字符串 -> less 变量
 * @param str less string
 * @returns { less_variable_obj, less_variable_func_obj }
 */
const getLessVariableAll = async (
  str: string
): Promise<{
  less_variable_obj: strObjProps;
  less_variable_func_obj: funcVariableProps;
}> => {
  return Promise.all([getLessVariable(str), getLessVariableFunc(str)]).then(
    arr => {
      return {
        less_variable_obj: arr[0],
        less_variable_func_obj: arr[1]
      };
    }
  );
};

/**
 *
 * @param theme_file_path_array
 * @return
 * {
 *  color: {
 *    less_variable_obj: {},
 *    less_variable_func_obj: {}
 *  },
 *  layout: {
 *    less_variable_obj: {},
 *    less_variable_func_obj: {}
 *  }
 * }
 */
export const getCommonVariables = async (
  theme_file_path_array: lessThemeObjProps
): Promise<lessVariablesObjProps> => {
  return Promise.all(
    Object.keys(theme_file_path_array).map(key =>
      getLessString(theme_file_path_array[key][0].origin_path)
        .then(formatLessString)
        .then(getLessVariableAll)
        .then(obj => [key, obj])
    )
  ).then(Object.fromEntries);
};

export const extractLess = async (
  less_file_path_array: lessThemeObjProps,
  theme_variables: lessVariablesObjProps
) => {
  let p = Promise.resolve();
  // color 替换之后再 替换 layout
  /**
   * #1 替换 color
   * #2 替换 layout
   */
  return Object.keys(less_file_path_array).map(key => {
    const categorys = less_file_path_array[key];
    const common_theme_variables = theme_variables[key];
    const p1 = () =>
      Promise.all(
        categorys.map(async (c: listenLessPathObjProps) => {
          let less_str = '';
          let less_obj: typeof common_theme_variables;
          return getLessString(c.origin_path)
            .then(formatLessString)
            .then(s => {
              less_str = s;
              return getLessVariableAll(s);
            })
            .then(obj => {
              console.log('obj: ', obj);
              console.log('less_str: ', less_str);
              return Object.assign(obj, common_theme_variables);
            })
            .then(() => replaceVariables(less_str, less_obj.less_variable_obj)) // 替换变量
            .then(final_str => fs.writeFile(c.new_path, final_str));
        })
      );
    p = p.then(p1).then();
  });
};
