import { test, describe } from '@jest/globals';
import fs from 'fs-extra';
import { getFileUTF8 } from '../src/util';
import formatLess from '../src/formatLess';
import expandFunction from '../src/expandFunction';

describe('expandFunction', async () => {
  test('1.less', () => {
    const less_file_path = './__tests__/lessFiles/1.less';
    const result_path = './__tests__/lessFiles/1.result.less';
    return getFileUTF8(less_file_path)
      .then(formatLess)
      .then(expandFunction)
      .then(formatLess)
      .then(data => fs.writeFile(result_path, data));
  });
  test('2.less', async () => {
    const less_file_path = './__tests__/lessFiles/2.less';
    const result_path = './__tests__/lessFiles/2.result.less';
    return getFileUTF8(less_file_path)
      .then(formatLess)
      .then(expandFunction)
      .then(formatLess)
      .then(data => fs.writeFile(result_path, data));
  });

  test('3.less', async () => {
    const less_file_path = './__tests__/lessFiles/3.less';
    const result_path = './__tests__/lessFiles/3.result.less';
    return getFileUTF8(less_file_path)
      .then(formatLess)
      .then(expandFunction)
      .then(formatLess)
      .then(data => fs.writeFile(result_path, data));
  });

  test('4.less', async () => {
    const less_file_path = './__tests__/lessFiles/4.less';
    const result_path = './__tests__/lessFiles/4.result.less';
    return getFileUTF8(less_file_path)
      .then(formatLess)
      .then(expandFunction)
      .then(formatLess)
      .then(str => fs.writeFile(result_path, str));
  });
});
