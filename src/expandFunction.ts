import {
  strObjProps,
  lessFunctionProps,
  funcDefinedProps,
  funcUsedProps,
  lessFuncTypeEnum
} from './Types';

const REGX_func_name = /\.[a-zA-Z]*(?=\()/g; // 匹配 .getTagName( 等函数名
const REGX_space = /\s/g; // 正则 空格
const REGX_used_func_params = /[\s,\(\)]/g; // 正则 空格
const REGX_func_params = /@[a-zA-Z-_\d]*/g;
const REGX_less_params = /@[a-zA-Z-_\d]+/g;

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
  const params = [...func_defined_name.matchAll(REGX_func_params)]
    .map(o => o[0])
    .filter(o => !!o);
  return params;
};

const getUsedFuncEndIndex = (str: string, start: number) => {
  return start + str.substring(start).search(';');
};

const getUsedFuncParams = (func_used_str: string, name: string): string[] => {
  const arr = func_used_str.split(REGX_used_func_params);
  if (arr[0] !== name) {
    return [];
  }
  return arr.filter(
    (item, index) => index !== 0 && arr.length - 1 !== index && item
  );
};

/**
 * 获取函数变量的 属性
 * @param str 函数名开头的字符串 .setSize(){xxxx}xxxxxxx
 * @param name 函数名 .setSize
 * @param start 
 * @returns {
    type: lessFuncTypeEnum.defined | lessFuncTypeEnum.used;
    name: string;
    start: number; // 标记定义函数 开始的 index
    end: number; // 标记定义函数 结束的 index
    params: string[];
    content?: string;
 * }
 */
const getFunctionPropsImpl = (
  str: string,
  name: string,
  start: number = 0
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
    const params = getUsedFuncParams(func_used_str, name);

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
 * 在每个使用到函数的地方展开函数主体部分
 * @param func_content
 * @param func_defined
 * @returns
 */
const expandFunctionImpl = (
  str: string,
  func_used: funcUsedProps,
  func_defined: { [name: string]: funcDefinedProps }
): string => {
  /**
   * 替换函数变量
   * [@color, @height, small]
   * [@primary-color-1, @padding-lg]
   */
  const params_map: strObjProps = {};
  func_used.params.forEach((value, index) => {
    let k = func_defined[func_used.name].params[index];
    params_map[k] = value;
  });

  if (Object.keys(params_map).length > 0) {
    let defined_content = func_defined[func_used.name].content;
    const arr = [...defined_content.matchAll(REGX_less_params)].reverse();
    arr.forEach(p => {
      let variable_name = p[0];
      let index = p.index;
      let length = variable_name.length;

      if (params_map[variable_name]) {
        defined_content =
          defined_content.substring(0, index) +
          params_map[variable_name] +
          defined_content.substring(index + length);
      }
    });

    str =
      str.substring(0, func_used.start) +
      defined_content +
      str.substring(func_used.end + 1);
  }
  return str;
};

/**
 *
 * @param str
 * @param func_defined
 * @returns
 */
const getNestFunction = (
  str: string,
  func_defined: { [name: string]: funcDefinedProps }
): string => {
  let func_regx_array = [...str.matchAll(REGX_func_name)];

  // 找到一个调用的函数，并且此函数在其他预定义的函数中被使用了。
  const func_defined_regx_obj = func_regx_array.find(
    item => func_defined[item[0]]
  );

  if (!func_defined_regx_obj) {
    return str;
  }

  const end = getUsedFuncEndIndex(str, func_defined_regx_obj.index);
  const func_used: funcUsedProps = {
    type: lessFuncTypeEnum.used,
    name: func_defined_regx_obj[0],
    start: func_defined_regx_obj.index, // 标记使用函数 开始的 index
    end, // 标记使用函数 结束的 index
    params: getUsedFuncParams(
      str.substring(func_defined_regx_obj.index, end),
      func_defined_regx_obj[0]
    )
  };
  str = expandFunctionImpl(str, func_used, func_defined);

  // return str;
  return getNestFunction(str, func_defined);
};

/**
 * 找到 less 文件中对应的 function 属性
 * @param str less 字符串
 * @return lessFunctionProps
 */
export const getFunctionProps = async (
  str: string
): Promise<lessFunctionProps> => {
  const func_regx_array_ = [...str.matchAll(REGX_func_name)];
  return Promise.all(
    func_regx_array_.map(item => {
      const func_name = item[0];
      const start = item.index;
      return getFunctionPropsImpl(str, func_name, start);
    })
  )
    .then(arr => {
      const data: lessFunctionProps = {
        func_used_array: [],
        func_defined: {}
      };
      arr
        .filter(i => i)
        .forEach(obj => {
          if (obj.type === 'used') {
            data.func_used_array.push(obj);
          }
          if (obj.type === 'defined') {
            data.func_defined[obj.name] = obj;
          }
        });
      return data;
    })
    .then(data => {
      // 处理预定义函数中有使用到其他函数 的情况
      Object.keys(data.func_defined).forEach(func_name => {
        data.func_defined[func_name].content = getNestFunction(
          data.func_defined[func_name].content,
          data.func_defined
        );
      });
      return data;
    });
};

/**
 * 展开函数
 *
 * #1 获取函数 Props
 *    1 找到匹配的函数名
 *    2 如果函数预定义内有嵌套函数， 展开所有嵌套函数
 *
 * #2 在每个使用到函数的地方展开函数主体部分
 */
export const expandFunction = async (
  str: string,
  common_func_defined?: { [name: string]: funcDefinedProps }
): Promise<string> => {
  return getFunctionProps(str).then(data => {
    const func_used_array = data.func_used_array.reverse();
    const func_defined_map = { ...common_func_defined, ...data.func_defined };

    func_used_array.forEach(func_used => {
      const c = str.substring(func_used.start, func_used.end);
      if (func_defined_map[func_used.name] && c.startsWith(func_used.name)) {
        str = expandFunctionImpl(str, func_used, data.func_defined);
      }
    });
    return str;
  });
};

export default expandFunction;
