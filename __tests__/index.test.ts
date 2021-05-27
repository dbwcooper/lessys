import { test, describe } from '@jest/globals';
import fs from 'fs-extra';
import extractLess from '../src/extractLess';
import { getFileUTF8, getLessVariable } from '../src/util';
import formatLess from '../src/formatLess';
import expandFunction from '../src/expandFunction';

const theme_path = './__tests__/theme/color/Default.less';

describe('all ', () => {
  test('1.less', async () => {
    const less_file_path = './__tests__/lessFiles/1.less';
    const result_path = './__tests__/lessFiles/1.result.less';

    const data = await getFileUTF8(theme_path);
    const theme_common_variable = getLessVariable(data);

    return getFileUTF8(less_file_path)
      .then(formatLess)
      .then(expandFunction)
      .then(str => extractLess(str, theme_common_variable))
      .then(data => {
        fs.writeFile(result_path, data);
      });
  });

  test('2.less', async () => {
    const less_file_path = './__tests__/lessFiles/2.less';
    const result_path = './__tests__/lessFiles/2.result.less';

    const data = await getFileUTF8(theme_path);
    const theme_common_variable = getLessVariable(data);

    return getFileUTF8(less_file_path)
      .then(formatLess)
      .then(expandFunction)
      .then(str => extractLess(str, theme_common_variable))
      .then(data => {
        fs.writeFile(result_path, data);
      });
  });

  test('3.less', async () => {
    const less_file_path = './__tests__/lessFiles/3.less';
    const result_path = './__tests__/lessFiles/3.result.less';

    const data = await getFileUTF8(theme_path);
    const theme_common_variable = getLessVariable(data);

    return getFileUTF8(less_file_path)
      .then(formatLess)
      .then(expandFunction)
      .then(str => extractLess(str, theme_common_variable))
      .then(data => {
        fs.writeFile(result_path, data);
      });
  });


  test('4.less', async () => {
    const less_file_path = './__tests__/lessFiles/4.less';
    const result_path = './__tests__/lessFiles/4.result.less';

    const data = await getFileUTF8(theme_path);
    const theme_common_variable = getLessVariable(data);

    return getFileUTF8(less_file_path)
      .then(formatLess)
      .then(expandFunction)
      .then(str => extractLess(str, theme_common_variable))
      .then(data => {
        fs.writeFile(result_path, data);
      });
  });
});
