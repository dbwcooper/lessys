import {
  strObjProps,
  funcVariableProps,
  funcDefinedProps,
  funcUsedProps,
  lessFuncTypeEnum
} from './Types';
import { replaceFuncParams } from './replaceVariables';

/**
 * 无法处理引用文件
 */
const REGX_variables = /;/g;
const REGX_func_name = /\.[a-zA-Z]*(?=\()/g; // 匹配 .getTagName( 等函数名
const REGX_space = /\s/g; // 正则 空格
const REGX_func_params = /@[a-zA-Z-_\d]*/g;

/**
 *
 * @param str string
 * @return {
 *   "@snx-m-color-1": "#ffffff",
 *   "@snx-m-color-2": "#f7f8f9",
 *   }
 * }
 */
export const getLessVariable = async (str: string): Promise<strObjProps> => {
  const variable_obj = str
    .split(REGX_variables)
    .reduce((prev: strObjProps = {}, current) => {
      if (current.includes(':')) {
        let variable = current.split(':')[0].trim();
        let variable_value = current.split(':')[1];
        // 去掉 @{ant-preix}-button: { }
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
          prev[variable] = variable_value;
        }
      }
      return prev;
    }, {});
  return variable_obj;
};

const getDefinedFuncStartIndex = (str: string, start: number): number => {
  return start + str.substring(start).search('{');
};

const getDefinedFuncEndIndex = (str: string, start: number): number => {
  // 函数内容
  let left_curly_braces = [];
  let right_curly_braces = [];
  const flag_index = [...str.substring(start).matchAll(/[{}]/g)].find(item => {
    if (item[0] === '{') {
      left_curly_braces.push(item.index);
    }
    if (item[0] === '}') {
      right_curly_braces.push(item.index);
    }
    return (
      left_curly_braces.length !== 0 &&
      left_curly_braces.length === right_curly_braces.length
    );
  }).index;
  return start + flag_index;
};

const getDefinedFuncParams = (func_defined_name: string): string[] => {
  const params = [...func_defined_name.matchAll(REGX_func_params)].map(
    o => o[0]
  );
  return params;
};

const getUsedFuncEndIndex = (str: string, start: number) => {
  return start + str.substring(start).search(';');
};

const getUsedFuncParams = (str: string): string[] => {
  const params = [...str.matchAll(REGX_func_params)].map(o => o[0]);
  return params;
};

const getFuncVariable = (
  str: string,
  name: string,
  start: number
): funcDefinedProps | funcUsedProps => {
  const flag_index = str.substring(start).search(/[{;]/g) + start;
  const func_flag_str = str
    .substring(start, flag_index + 1)
    .replace(REGX_space, '');

  let type = 'others';
  if (func_flag_str.indexOf(')when(') > -1) {
    type = 'others';
  } else if (func_flag_str.substr(-2) !== '){') {
    type = 'used';
  } else {
    type = 'defined';
  }
  if (type === 'used') {
    const end = getUsedFuncEndIndex(str, start);
    const func_used_str = str.substring(start, end);
    const params = getUsedFuncParams(func_used_str);

    const func_obj: funcUsedProps = {
      name,
      start,
      type: lessFuncTypeEnum.used,
      end,
      params
    };
    return func_obj;
  } else if (type === 'defined') {
    const defined_func_start = getDefinedFuncStartIndex(str, start);
    const defined_func_end = getDefinedFuncEndIndex(str, defined_func_start);
    const func_defined_content = str.substring(
      defined_func_start + 1,
      defined_func_end
    );
    const params = getDefinedFuncParams(
      str.substring(start, defined_func_start)
    );
    const func_obj: funcDefinedProps = {
      name,
      start: defined_func_start,
      end: defined_func_end,
      type: lessFuncTypeEnum.defined,
      params,
      content: func_defined_content
    };
    return func_obj;
  }
};

/**
 *
 * @param content
 * @param func_defined
 * @returns
 */
const handleNestDefinedFunc = (
  content: string,
  func_defined: { [name: string]: funcDefinedProps }
): string => {
  let func_regx_array = [...content.matchAll(REGX_func_name)];

  // 找到一个在此文件中预定义的函数，并且此函数在其他预定义的函数中被使用了。
  const func_defined_regx_obj = func_regx_array.find(item => func_defined[item[0]]);

  if (!func_defined_regx_obj) {
    return content;
  }

  if (func_defined_regx_obj) {
    const nest_func_name = func_defined_regx_obj[0];
    const func_used_start = func_defined_regx_obj.index;
    const func_used_end = getUsedFuncEndIndex(content, func_used_start);
    const func_used_params = getUsedFuncParams(
      content.substring(func_used_start, func_used_end)
    );
    const params_mapping: strObjProps = {};
    func_used_params.forEach((k, index) => {
      params_mapping[k] = func_defined[nest_func_name].params[index];
    });
    const nest_func_content = replaceFuncParams(
      func_defined[nest_func_name].content,
      params_mapping
    );
    content =
      content.substring(0, func_used_start) +
      nest_func_content +
      content.substring(func_used_end + 1);
  }
  return handleNestDefinedFunc(content, func_defined);
};

/**
 * 找到 对应的 function
 * @param str less 文件对应的字符串
 * @return funcVariableProps
 */
export const getLessVariableFunc = async (
  str: string
): Promise<funcVariableProps> => {
  const func_regx_array_ = [...str.matchAll(REGX_func_name)];
  const data: funcVariableProps = {
    func_used_array: [],
    func_defined: {}
  };
  return Promise.all(
    func_regx_array_.map(item => {
      const func_name = item[0];
      const start = item.index;
      return getFuncVariable(str, func_name, start);
    })
  )
    .then(arr => {
      arr.forEach(func_obj => {
        if (func_obj.type === 'used') {
          data.func_used_array.push(func_obj);
        } else if (func_obj.type === 'defined') {
          const name = func_obj.name;
          data.func_defined[name] = func_obj;
        }
      });
      return data;
    })
    .then(data => {
      const func_defined = data.func_defined;
      Object.keys(func_defined).map(func_name => {
        let old_content = func_defined[func_name].content;
        func_defined[func_name].content = handleNestDefinedFunc(
          old_content,
          func_defined
        );
      });
      data.func_defined = func_defined;
      return data;
    });
};
