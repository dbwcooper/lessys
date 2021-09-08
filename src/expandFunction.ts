import {
  strObjProps,
  lessFunctionProps,
  funcDefinedProps,
  funcUsedProps,
  lessFuncTypeEnum,
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
  let lcb = []; // left curly braces
  let rcb = []; // right curly braces
  // flag index
  const fi = [...str.substring(start).matchAll(/[{}]/g)].find((item) => {
    if (item[0] === '{') {
      lcb.push(item.index);
    }
    if (item[0] === '}') {
      rcb.push(item.index);
    }
    return lcb.length !== 0 && lcb.length === rcb.length;
  }).index;
  return start + fi;
};

const getDefinedFuncParams = (fdn: string): string[] => {
  // function defined name
  const params = [...fdn.matchAll(REGX_func_params)]
    .map((o) => o[0])
    .filter((o) => !!o);
  return params;
};

const getUsedFuncEndIndex = (str: string, start: number) => {
  return start + str.substring(start).search(';');
};

const getUsedFuncParams = (fus: string, name: string): string[] => {
  // function used string
  const arr = fus.split(REGX_used_func_params);
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
const getLessFunctionImpl = (
  str: string,
  name: string,
  start: number = 0
): funcDefinedProps | funcUsedProps => {
  const fi = str.substring(start).search(/[{;]/g) + start; // flag index
  // function flag string
  const ffs = str.substring(start, fi + 1).replace(REGX_space, '');

  let type = 'others';
  if (ffs.indexOf(')when(') > -1) {
    type = 'others';
  } else if (ffs.substr(-2) !== '){') {
    type = 'used';
  } else {
    type = 'defined';
  }
  if (type === 'used') {
    const end = getUsedFuncEndIndex(str, start);
    // function used string
    const fus = str.substring(start, end);
    const params = getUsedFuncParams(fus, name);

    // fucntion obj
    const fo: funcUsedProps = {
      name,
      start,
      type: lessFuncTypeEnum.used,
      end,
      params,
    };
    return fo;
  } else if (type === 'defined') {
    // func defined start
    const fds = getDefinedFuncStartIndex(str, start);
    // func defined end
    const fde = getDefinedFuncEndIndex(str, fds);
    //func defined content
    const fdc = str.substring(fds + 1, fde);
    const params = getDefinedFuncParams(str.substring(start, fds));
    const fo: funcDefinedProps = {
      name,
      start: fds,
      end: fde,
      type: lessFuncTypeEnum.defined,
      params,
      content: fdc,
    };
    return fo;
  }
};

/**
 * 在每个使用到函数的地方展开函数主体部分
 */
const expandFunctionImpl = (
  str: string,
  fu: funcUsedProps,
  fd: { [name: string]: funcDefinedProps }
): string => {
  /**
   * 替换函数变量
   * [@color, @height, small]
   * [@primary-color-1, @padding-lg]
   */
  const pm: strObjProps = {}; // params map
  fu.params.forEach((value, index) => {
    let k = fd[fu.name].params[index];
    pm[k] = value;
  });

  if (Object.keys(pm).length > 0) {
    // function defined_content
    let fdc = fd[fu.name].content;
    const arr = [...fdc.matchAll(REGX_less_params)].reverse();
    arr.forEach((p) => {
      let variable_name = p[0];
      let index = p.index;
      let length = variable_name.length;

      if (pm[variable_name]) {
        fdc =
          fdc.substring(0, index) +
          pm[variable_name] +
          fdc.substring(index + length);
      }
    });

    str = str.substring(0, fu.start) + fdc + str.substring(fu.end + 1);
  }
  return str;
};

/**
 *
 * @param str
 * @param funcDefined
 * @returns
 */
const getNestFunction = (
  str: string,
  fd: { [name: string]: funcDefinedProps }
): string => {
  // function regx array
  let fra = [...str.matchAll(REGX_func_name)];

  // 找到一个调用的函数，并且此函数在其他预定义的函数中被使用了。
  // func Defined obj
  const fdo = fra.find((item) => fd[item[0]]);

  if (!fdo) {
    return str;
  }

  const end = getUsedFuncEndIndex(str, fdo.index);
  const func_used: funcUsedProps = {
    type: lessFuncTypeEnum.used,
    name: fdo[0],
    start: fdo.index, // 标记使用函数 开始的 index
    end, // 标记使用函数 结束的 index
    params: getUsedFuncParams(str.substring(fdo.index, end), fdo[0]),
  };
  str = expandFunctionImpl(str, func_used, fd);

  // return str;
  return getNestFunction(str, fd);
};

/**
 * 找到 less 文件中对应的 function 属性
 * @param str less 字符串
 * @return lessFunctionProps
 */
export const getLessFunction = async (
  str: string
): Promise<lessFunctionProps> => {
  // function regx array
  const fra = [...str.matchAll(REGX_func_name)];
  return Promise.all(
    fra.map((item) => {
      const func_name = item[0];
      const start = item.index;
      return getLessFunctionImpl(str, func_name, start);
    })
  )
    .then((arr) => {
      const data: lessFunctionProps = {
        funcUsedList: [],
        funcDefined: {},
      };
      arr
        .filter((i) => i)
        .forEach((obj) => {
          if (obj.type === 'used') {
            data.funcUsedList.push(obj);
          }
          if (obj.type === 'defined') {
            data.funcDefined[obj.name] = obj;
          }
        });
      return data;
    })
    .then((data) => {
      // 处理预定义函数中有使用到其他函数 的情况
      Object.keys(data.funcDefined).forEach((func_name) => {
        data.funcDefined[func_name].content = getNestFunction(
          data.funcDefined[func_name].content,
          data.funcDefined
        );
      });
      return data;
    });
};

/**
 * 处理 less 展开函数
 *
 * #1 获取函数 Props
 *    1 找到匹配的函数名
 *    2 如果函数预定义内有嵌套函数， 展开所有嵌套函数
 *
 * #2 在每个使用到函数的地方展开函数主体部分
 */
export const expandFunction = async (
  str: string,
  commonFuncDefined?: { [name: string]: funcDefinedProps }
): Promise<string> => {
  return getLessFunction(str).then((data) => {
    const funcUsedList = data.funcUsedList.reverse();
    const funcDefinedAll = { ...commonFuncDefined, ...data.funcDefined };

    funcUsedList.forEach((funcUsed) => {
      const c = str.substring(funcUsed.start, funcUsed.end);
      if (funcDefinedAll[funcUsed.name] && c.startsWith(funcUsed.name)) {
        str = expandFunctionImpl(str, funcUsed, data.funcDefined);
      }
    });
    return str;
  });
};

export default expandFunction;
