import { test } from '@jest/globals';
import fs from 'fs-extra';
import extractLess from '../src/extractLess';
import { getFileUTF8, getLessVariable } from '../src/util';
import formatLess from '../src/formatLess';

const variable = {
  '@snx-m-color-4': '#333',
  '@snx-m-color-5': '#fff'
};
const theme_path = './test/theme/color/Default.less';

test('getLessVariable', async () => {
  const theme_variable = await getLessVariable(theme_path);
  console.log('theme_variable:', theme_variable);
});

// test('expandLess1', async () => {
//   const less_file_path = './test/lessFiles/1.less';
//   const result_path = './test/lessFiles/1.result.less';
//   const theme_variable = await getLessVariable(theme_path);
//   return getFileUTF8(less_file_path)
//     .then(formatLess)
//     .then(str => extractLess(str, theme_variable))
//     .then(data => {
//       fs.writeFile(result_path, data);
//     });
// });

// test('expandLess2', async () => {
//   const less_file_path = './test/lessFiles/2.less';
//   const result_path = './test/lessFiles/2.result.less';
//   const theme_variable = await getLessVariable(theme_path);
//   return getFileUTF8(less_file_path)
//     .then(formatLess)
//     .then(str => extractLess(str, theme_variable))
//     .then(data => {
//       fs.writeFile(result_path, data);
//     });
// });
