import { test, expect } from '@jest/globals';
import fs from 'fs-extra';
import path from 'path';
import { replaceFuncParams } from '../src/replaceVariables';
import { getLessVariableFunc } from '../src/storeVariables';
import { getLessString, formatLessString } from '../src/util';

const setLessString = async (file_path: string, data: string): Promise<void> =>
  fs.writeFile(path.resolve(file_path), data);

// test('1.less to 1.result.less', async () => {
//   const file_path = './test/mock/functions/1.less';
//   const result_path = './test/mock/functions/1.result.less';
//   let less_str = '';
//   return getLessString(file_path)
//     .then(str => {
//       less_str = str;
//       return getLessVariableFunc(less_str);
//     })
//     .then(less_variable_func_obj => {
//       console.log('less_variable_func_obj: ', less_variable_func_obj);
//       return replaceFuncVairables(less_str, less_variable_func_obj);
//     })
//     .then(data => {
//       return setLessString(result_path, data);
//     });
// });

// test('2.less to 2.result.less', async () => {
//   const file_path = './test/mock/functions/2.less';
//   const result_path = './test/mock/functions/2.result.less';
//   let less_str = '';
//   return getLessString(file_path)
//     .then(str => {
//       less_str = str;
//       return getLessVariableFunc(less_str);
//     })
//     .then(less_variable_func_obj => {
//       return replaceFuncVairables(less_str, less_variable_func_obj);
//     })
//     .then(data => {
//       return setLessString(result_path, data);
//     });
// });

// test('3.less to 3.result.less', async () => {
//   const file_path = './test/mock/functions/3.less';
//   const result_path = './test/mock/functions/3.result.less';
//   let less_str = '';
//   return getLessString(file_path)
//     .then(formatLessString)
//     .then(str => {
//       less_str = str;
//       return getLessVariableFunc(less_str);
//     })
//     .then(less_variable_func_obj => {
//       console.log('less_variable_func_obj: ', less_variable_func_obj);
//       return replaceFuncVairables(less_str, less_variable_func_obj);
//     })
//     .then(data => {
//       return setLessString(result_path, data);
//     });
// });

// TODO: test
/**
 * #1 获取 less 文件
 * #2 格式化 less 文件
 * #3 替换 less 文件中的变量（核心）
 *    1. 展开函数，展开嵌套函数
 *    2. 替换 less 变量
 *    // 3. 支持传入 变量|函数
 * #4 保存替换之后的less文件
 */
test('4.less to 4.result.less', async () => {
  const file_path = './test/mock/functions/4.less';
  const result_path = './test/mock/functions/4.result.less';
  let less_str = '';
  return getLessString(file_path)
    .then(formatLessString)
    .then(str => {
      less_str = str;
      return getLessVariableFunc(less_str);
    })
    .then(less_variable_func_obj => {
      return replaceFuncParams(less_str, less_variable_func_obj);
    })
    .then(data => {
      // return setLessString(result_path, data);
    });
});
